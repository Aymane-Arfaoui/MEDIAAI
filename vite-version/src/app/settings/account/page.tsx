"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Cloud, Server, Shield, Lock, FileText, CheckCircle2, Send } from "lucide-react"

const accountFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
})

const implementationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  company: z.string().min(1, "Company is required"),
  message: z.string().optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>
type ImplementationFormValues = z.infer<typeof implementationSchema>

export default function AccountSettings() {
  const [deploymentMode, setDeploymentMode] = useState<'cloud' | 'onprem'>('cloud')
  const [implementationSubmitted, setImplementationSubmitted] = useState(false)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
    },
  })

  const implementationForm = useForm<ImplementationFormValues>({
    resolver: zodResolver(implementationSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: "",
    },
  })

  function onSubmit(data: AccountFormValues) {
    console.log("Form submitted:", data)
  }

  function onImplementationSubmit(data: ImplementationFormValues) {
    console.log("Implementation request:", data)
    setImplementationSubmitted(true)
  }

  return (
    <BaseLayout>
      <div className="space-y-6 px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your AI CEO account, deployment, and security settings.
          </p>
        </div>

        {/* Deployment Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Deployment Mode
            </CardTitle>
            <CardDescription>
              Choose how AI CEO is deployed for your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={deploymentMode}
              onValueChange={(value) => setDeploymentMode(value as 'cloud' | 'onprem')}
              className="grid gap-4 md:grid-cols-2"
            >
              <div className={`relative flex items-start space-x-4 rounded-lg border p-4 cursor-pointer ${deploymentMode === 'cloud' ? 'border-primary bg-primary/5' : ''}`}>
                <RadioGroupItem value="cloud" id="cloud" className="mt-1" />
                <Label htmlFor="cloud" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Cloud className="h-4 w-4 text-primary" />
                    <span className="font-medium">Cloud</span>
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fully managed by AI CEO. Automatic updates, backups, and scaling.
                  </p>
                </Label>
              </div>

              <div className={`relative flex items-start space-x-4 rounded-lg border p-4 cursor-pointer ${deploymentMode === 'onprem' ? 'border-primary bg-primary/5' : ''}`}>
                <RadioGroupItem value="onprem" id="onprem" className="mt-1" />
                <Label htmlFor="onprem" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Server className="h-4 w-4 text-primary" />
                    <span className="font-medium">On-Premise</span>
                    <Badge variant="outline" className="text-xs">Enterprise</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Deploy on your infrastructure. Complete data sovereignty.
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Security Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Checklist
            </CardTitle>
            <CardDescription>
              Security measures in place for your AI CEO deployment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <span className="font-medium">Read-Only Access</span>
                  <p className="text-sm text-muted-foreground">AI CEO never modifies your source data</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <span className="font-medium">End-to-End Encryption</span>
                  <p className="text-sm text-muted-foreground">All data transfers encrypted with TLS 1.3</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <span className="font-medium">Audit Logs</span>
                  <p className="text-sm text-muted-foreground">Complete audit trail of all data access</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <span className="font-medium">SOC 2 Compliant</span>
                  <p className="text-sm text-muted-foreground">Infrastructure meets enterprise security standards</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-green-500" />
                <div>
                  <span className="font-medium">Data Isolation</span>
                  <p className="text-sm text-muted-foreground">Your data is isolated from other customers</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your account details for AI CEO.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Button type="submit" className="cursor-pointer">Save Changes</Button>
              <Button variant="outline" type="reset" className="cursor-pointer">Cancel</Button>
            </div>
          </form>
        </Form>

        {/* Implementation Request */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Request Implementation
            </CardTitle>
            <CardDescription>
              Need help setting up AI CEO for your organization? Our team can help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {implementationSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Request Submitted!</h3>
                <p className="text-muted-foreground">
                  Our team will reach out within 1-2 business days.
                </p>
              </div>
            ) : (
              <Form {...implementationForm}>
                <form onSubmit={implementationForm.handleSubmit(onImplementationSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={implementationForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={implementationForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={implementationForm.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Company Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={implementationForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tell us about your needs</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What data sources do you need to connect? Any specific requirements?" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="cursor-pointer">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  )
}
