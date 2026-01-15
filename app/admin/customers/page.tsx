import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export const metadata = {
  title: "Customers - Admin Dashboard",
}

export default async function AdminCustomersPage() {
  const supabase = await createClient()

  const { data: customers } = await supabase.from("users").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground">Manage customer accounts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers ({customers?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers && customers.length > 0 ? (
              customers.map((customer: any) => (
                <div key={customer.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                  <Avatar>
                    <AvatarFallback>{customer.full_name?.[0] || customer.email[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{customer.full_name || "No name"}</h3>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Joined: {new Date(customer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No customers found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
