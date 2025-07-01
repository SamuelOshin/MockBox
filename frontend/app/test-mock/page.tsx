"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Test UUID for demonstration
const TEST_MOCK_ID = "987fcdeb-51d3-42a1-b456-123456789abc"

export default function TestMockPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Mock Navigation Test</CardTitle>
          <CardDescription>
            Test the navigation to mock detail page with a proper UUID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p><strong>Test Mock ID:</strong> {TEST_MOCK_ID}</p>
            <p><strong>Expected URL:</strong> /mocks/{TEST_MOCK_ID}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Test Navigation:</h3>
            <Link href={`/mocks/${TEST_MOCK_ID}`}>
              <Button className="w-full">
                Navigate to Mock Detail Page
              </Button>
            </Link>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Expected Behavior:</h3>
            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
              <li>Click the button above</li>
              <li>It should navigate to /mocks/{TEST_MOCK_ID}</li>
              <li>The page should show a loading state</li>
              <li>Then show an error (since this mock doesn't exist)</li>
              <li>You should see a "Mock not found" or "Failed to load mock" message</li>
              <li>There should be a "Retry" or "Go Back" button</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">What to Check:</h3>
            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
              <li>Navigation works (URL changes)</li>
              <li>Loading state appears briefly</li>
              <li>Error handling displays correctly</li>
              <li>UI is user-friendly even for non-existent mocks</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
