import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function AddressesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Addresses</h1>
        <Button>Add New Address</Button>
      </div>

      {addresses && addresses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address: any) => (
            <Card key={address.id}>
              <CardContent className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-semibold">{address.full_name}</p>
                  {address.is_default && <Badge>Default</Badge>}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>
                    {address.city}, {address.postal_code}
                  </p>
                  <p>{address.country}</p>
                  <p>{address.phone}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="mb-4 text-muted-foreground">You haven't saved any addresses yet</p>
            <Button>Add Your First Address</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
