
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/data/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  ArrowUpDown,
  Trash2,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function SupplierList() {
  const { suppliers, deleteSupplier } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      deleteSupplier(id);
      toast.success("Supplier deleted successfully");
    }
  };

  // Get all unique categories
  const categories = Array.from(
    new Set(suppliers.map((supplier) => supplier.category).filter(Boolean))
  );

  // Filter suppliers by search term and category
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
      supplier.phone.includes(searchTerm);
    
    const matchesCategory = 
      !categoryFilter || supplier.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Sort suppliers
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    if (!sortBy) return 0;

    const fieldA = a[sortBy as keyof typeof a];
    const fieldB = b[sortBy as keyof typeof b];

    if (fieldA === fieldB) return 0;

    if (fieldA == null) return sortDirection === "asc" ? -1 : 1;
    if (fieldB == null) return sortDirection === "asc" ? 1 : -1;

    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return sortDirection === "asc"
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    } else {
      return sortDirection === "asc"
        ? Number(fieldA) - Number(fieldB)
        : Number(fieldB) - Number(fieldA);
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your suppliers and vendor details
          </p>
        </div>
        <Button onClick={() => navigate("/supplier/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Supplier
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {categories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  {categoryFilter || "Filter by Category"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Categories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCategoryFilter(null)}>
                  All Categories
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category as string}
                    onClick={() => setCategoryFilter(category as string)}
                  >
                    {category as string}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {(searchTerm || categoryFilter) && (
            <div className="flex gap-2">
              {searchTerm && (
                <Badge variant="outline" className="gap-1">
                  "{searchTerm}"
                  <button
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                    onClick={() => setSearchTerm("")}
                  >
                    ×
                  </button>
                </Badge>
              )}
              {categoryFilter && (
                <Badge variant="outline" className="gap-1">
                  {categoryFilter}
                  <button
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                    onClick={() => setCategoryFilter(null)}
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}

          <div className="ml-auto text-sm text-muted-foreground">
            {sortedSuppliers.length} suppliers
          </div>
        </div>
      </Card>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead
                className="cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Supplier Name
                  {sortBy === "name" && (
                    <ArrowUpDown
                      className={`ml-2 h-4 w-4 ${
                        sortDirection === "desc" ? "rotate-180" : ""
                      } transition-transform`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category
                  {sortBy === "category" && (
                    <ArrowUpDown
                      className={`ml-2 h-4 w-4 ${
                        sortDirection === "desc" ? "rotate-180" : ""
                      } transition-transform`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleSort("outstandingBalance")}
              >
                <div className="flex items-center">
                  Outstanding
                  {sortBy === "outstandingBalance" && (
                    <ArrowUpDown
                      className={`ml-2 h-4 w-4 ${
                        sortDirection === "desc" ? "rotate-180" : ""
                      } transition-transform`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSuppliers.length > 0 ? (
              sortedSuppliers.map((supplier) => (
                <TableRow
                  key={supplier.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium">
                    {supplier.name}
                    {supplier.contactPerson && (
                      <p className="text-sm text-muted-foreground">
                        {supplier.contactPerson}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {supplier.category || "Uncategorized"}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <span>{supplier.phone}</span>
                      </div>
                      {supplier.email && (
                        <div className="flex items-center">
                          <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          <span className="text-sm">{supplier.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span
                        className={
                          supplier.outstandingBalance && supplier.outstandingBalance > 0
                            ? "text-amber-600 dark:text-amber-400"
                            : ""
                        }
                      >
                        ₹{supplier.outstandingBalance?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/supplier/edit/${supplier.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(supplier.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  {searchTerm || categoryFilter
                    ? "No suppliers match your search criteria."
                    : "No suppliers found. Add your first supplier to get started."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
