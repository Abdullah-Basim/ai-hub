"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Shield } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [userPlan, setUserPlan] = useState("free")
  const [credits, setCredits] = useState(0)

  const handleSubscribe = async () => {
    setIsLoading(true)

    try {
      // In a real app, this would redirect to Stripe checkout
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Subscription started",
        description: "You have been redirected to the payment page.",
      })

      // Simulate redirect to Stripe
      window.location.href = "#stripe-checkout"
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyCredits = async (amount: number) => {
    setIsLoading(true)

    try {
      // In a real app, this would redirect to Stripe checkout
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Purchase started",
        description: `You are purchasing ${amount} credits.`,
      })

      // Simulate redirect to Stripe
      window.location.href = "#stripe-checkout"
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to start purchase process. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account, subscription, and credits.</p>
      </div>

      <Tabs defaultValue="subscription">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your current subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Plan:</span>
                    <span>{userPlan === "premium" ? "Premium" : "Free"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status:</span>
                    <span>{userPlan === "premium" ? "Active" : "Not subscribed"}</span>
                  </div>
                  {userPlan === "premium" && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Next billing date:</span>
                      <span>July 15, 2023</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {userPlan === "premium" ? (
                  <Button variant="outline" className="w-full">
                    Manage Subscription
                  </Button>
                ) : (
                  <Button className="w-full" onClick={handleSubscribe} disabled={isLoading}>
                    {isLoading ? "Processing..." : "Upgrade to Premium"}
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Premium Benefits</CardTitle>
                <CardDescription>What you get with Premium</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Unlimited access to all premium models</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Pay-as-you-go for ultra-premium models</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Advanced prompt history & file uploads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <p className="text-center text-sm text-muted-foreground">Just $10/month. Cancel anytime.</p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="credits" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Credit Balance</CardTitle>
                <CardDescription>Your current credit balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Available credits:</span>
                    <span>{credits}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Credits are used for ultra-premium models like GPT-4 Turbo, Claude 3, and Sora.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Buy Credits</CardTitle>
                <CardDescription>Purchase credits for ultra-premium models</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="flex flex-col gap-1 p-4"
                    onClick={() => handleBuyCredits(100)}
                    disabled={isLoading}
                  >
                    <span className="text-lg font-bold">100</span>
                    <span className="text-sm">$10</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col gap-1 p-4"
                    onClick={() => handleBuyCredits(250)}
                    disabled={isLoading}
                  >
                    <span className="text-lg font-bold">250</span>
                    <span className="text-sm">$20</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col gap-1 p-4"
                    onClick={() => handleBuyCredits(500)}
                    disabled={isLoading}
                  >
                    <span className="text-lg font-bold">500</span>
                    <span className="text-sm">$35</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col gap-1 p-4"
                    onClick={() => handleBuyCredits(1000)}
                    disabled={isLoading}
                  >
                    <span className="text-lg font-bold">1000</span>
                    <span className="text-sm">$60</span>
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-center text-sm text-muted-foreground">
                  Credits never expire. Subscription required to purchase credits.
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Name</span>
                  <span>{user?.user_metadata?.name || "Not available"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Email</span>
                  <span>{user?.email || "Not available"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Account created</span>
                  <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Not available"}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Change Password</Button>
              <Button variant="destructive">Delete Account</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
