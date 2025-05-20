
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import Database from 'better-sqlite3';
import log from 'electron-log';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database API class
class DbApi {
  constructor() {
    this.db = null;
    this.dbPath = '';
  }
  
  // Initialize the database
  initialize() {
    try {
      // Create data directory if it doesn't exist
      const dataDir = path.join(app.getPath('userData'), 'database');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // Set the database path
      this.dbPath = path.join(dataDir, 'milk-centre.db');
      log.info(`Initializing database at: ${this.dbPath}`);
      
      // Create the database connection
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      
      // Create tables if they don't exist
      this.createTables();
      
      log.info('Database initialized successfully');
      return { success: true };
    } catch (error) {
      log.error('Database initialization failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Create database tables
  createTables() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    // Customers table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        address TEXT,
        outstandingBalance REAL DEFAULT 0,
        lastPaymentDate TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Products table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        category TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Orders table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customerId TEXT NOT NULL,
        totalAmount REAL NOT NULL,
        date TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers (id)
      )
    `);
    
    // Order items table (junction table)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        orderId TEXT NOT NULL,
        productId TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (orderId) REFERENCES orders (id),
        FOREIGN KEY (productId) REFERENCES products (id)
      )
    `);
    
    // Invoices table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        customerId TEXT NOT NULL,
        orderId TEXT,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        dueDate TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers (id),
        FOREIGN KEY (orderId) REFERENCES orders (id)
      )
    `);
    
    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        value TEXT,
        category TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    log.info('Database tables created successfully');
  }
  
  // Save (insert or update) records
  save(table, data) {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      // Validate table name
      this.validateTableName(table);
      
      if (Array.isArray(data)) {
        // Handle array of records (batch operation)
        const results = [];
        
        // Start a transaction
        this.db.exec('BEGIN TRANSACTION');
        
        try {
          for (const item of data) {
            const result = this.saveItem(table, item);
            results.push(result);
          }
          
          // Commit the transaction
          this.db.exec('COMMIT');
        } catch (error) {
          // Rollback on error
          this.db.exec('ROLLBACK');
          throw error;
        }
        
        return { success: true, data: results };
      } else {
        // Handle single record
        const result = this.saveItem(table, data);
        return { success: true, data: result };
      }
    } catch (error) {
      log.error(`Error saving data to ${table}:`, error);
      return { success: false, error: error.message };
    }
  }
  
  // Save a single item (helper method)
  saveItem(table, item) {
    if (!item.id) {
      item.id = crypto.randomUUID();
    }
    
    // Special case for order_items with composite key
    if (table === 'order_items' && !item.id) {
      item.id = `${item.orderId}_${item.productId}`;
    }
    
    // Get the table columns
    const columns = Object.keys(item)
      .filter(key => key !== 'createdAt') // Don't update createdAt
      .map(key => `${key} = ?`)
      .join(', ');
    
    // Add updatedAt for all tables except order_items
    const values = Object.entries(item)
      .filter(([key]) => key !== 'createdAt')
      .map(([, value]) => value);
    
    if (table !== 'order_items') {
      columns ? columns + ', updatedAt = ?' : 'updatedAt = ?';
      values.push(new Date().toISOString());
    }
    
    // Check if the record exists
    const existsQuery = this.db.prepare(`SELECT 1 FROM ${table} WHERE id = ?`);
    const exists = existsQuery.get(item.id);
    
    if (exists) {
      // Update existing record
      const updateQuery = this.db.prepare(`UPDATE ${table} SET ${columns} WHERE id = ?`);
      updateQuery.run(...values, item.id);
    } else {
      // Insert new record
      const columnNames = Object.keys(item).join(', ');
      const placeholders = Object.keys(item).map(() => '?').join(', ');
      const insertQuery = this.db.prepare(`INSERT INTO ${table} (${columnNames}) VALUES (${placeholders})`);
      insertQuery.run(...Object.values(item));
    }
    
    // Return the saved item
    const savedItem = this.getById(table, item.id);
    return savedItem.data;
  }
  
  // Query records
  query(table, params = {}) {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      // Validate table name
      this.validateTableName(table);
      
      // Build the query
      let query = `SELECT * FROM ${table}`;
      const queryParams = [];
      
      // Add WHERE clause if provided
      if (params.where && Object.keys(params.where).length > 0) {
        const whereConditions = Object.entries(params.where)
          .map(([key, value]) => {
            queryParams.push(value);
            return `${key} = ?`;
          })
          .join(' AND ');
        
        query += ` WHERE ${whereConditions}`;
      }
      
      // Add ORDER BY clause if provided
      if (params.orderBy) {
        query += ` ORDER BY ${params.orderBy}`;
      }
      
      // Add LIMIT and OFFSET clauses if provided
      if (typeof params.limit === 'number') {
        query += ` LIMIT ?`;
        queryParams.push(params.limit);
        
        if (typeof params.offset === 'number') {
          query += ` OFFSET ?`;
          queryParams.push(params.offset);
        }
      }
      
      // Execute the query
      const stmt = this.db.prepare(query);
      const results = stmt.all(...queryParams);
      
      return { success: true, data: results };
    } catch (error) {
      log.error(`Error querying data from ${table}:`, error);
      return { success: false, error: error.message };
    }
  }
  
  // Get a single record by ID
  getById(table, id) {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      // Validate table name
      this.validateTableName(table);
      
      // Execute the query
      const stmt = this.db.prepare(`SELECT * FROM ${table} WHERE id = ?`);
      const result = stmt.get(id);
      
      return { success: true, data: result || null };
    } catch (error) {
      log.error(`Error getting record ${id} from ${table}:`, error);
      return { success: false, error: error.message };
    }
  }
  
  // Delete records
  delete(table, id) {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      // Validate table name
      this.validateTableName(table);
      
      if (Array.isArray(id)) {
        // Handle array of IDs (batch delete)
        const placeholders = id.map(() => '?').join(', ');
        const stmt = this.db.prepare(`DELETE FROM ${table} WHERE id IN (${placeholders})`);
        const result = stmt.run(...id);
        
        return { success: true, deleted: result.changes };
      } else {
        // Handle single ID
        const stmt = this.db.prepare(`DELETE FROM ${table} WHERE id = ?`);
        const result = stmt.run(id);
        
        return { success: true, deleted: result.changes };
      }
    } catch (error) {
      log.error(`Error deleting data from ${table}:`, error);
      return { success: false, error: error.message };
    }
  }
  
  // Import data into a table
  importTable(table, data) {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      // Validate table name
      this.validateTableName(table);
      
      // Start a transaction
      this.db.exec('BEGIN TRANSACTION');
      
      try {
        // Clear the table
        this.db.exec(`DELETE FROM ${table}`);
        
        // Insert the new data
        for (const item of data) {
          this.saveItem(table, item);
        }
        
        // Commit the transaction
        this.db.exec('COMMIT');
        return { success: true, count: data.length };
      } catch (error) {
        // Rollback on error
        this.db.exec('ROLLBACK');
        throw error;
      }
    } catch (error) {
      log.error(`Error importing data to ${table}:`, error);
      return { success: false, error: error.message };
    }
  }
  
  // Validate table name to prevent SQL injection
  validateTableName(table) {
    const validTables = ['customers', 'products', 'orders', 'order_items', 'invoices', 'settings'];
    
    if (!validTables.includes(table)) {
      throw new Error(`Invalid table name: ${table}`);
    }
  }
}

export default new DbApi();
