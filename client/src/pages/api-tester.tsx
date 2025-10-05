import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Send } from "lucide-react";

export default function ApiTester() {
  const [email, setEmail] = useState("test@example.com");
  const [token, setToken] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const generateToken = async () => {
    try {
      const res = await fetch("/api/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setToken(data.token);
      toast({ title: "Token generated", description: "JWT token created successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate token", variant: "destructive" });
    }
  };

  const createTask = async () => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ title: taskTitle, description: taskDescription }),
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      toast({ title: "Task created", description: "Email notification sent!" });
      setTaskTitle("");
      setTaskDescription("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    }
  };

  const getTasks = async () => {
    try {
      const res = await fetch("/api/tasks", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch tasks", variant: "destructive" });
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    toast({ title: "Copied", description: "Token copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-title">Todo API Tester</h1>
          <p className="text-muted-foreground" data-testid="text-subtitle">
            JWT-protected REST API with email notifications
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-card-title-token">1. Generate JWT Token</CardTitle>
              <CardDescription>Create a test token for authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  data-testid="input-email"
                />
              </div>
              <Button onClick={generateToken} className="w-full" data-testid="button-generate-token">
                <Send className="w-4 h-4 mr-2" />
                Generate Token
              </Button>
              {token && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Your Token</Label>
                    <Button variant="ghost" size="sm" onClick={copyToken} data-testid="button-copy-token">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={token}
                    readOnly
                    className="font-mono text-xs"
                    rows={4}
                    data-testid="text-token"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle data-testid="text-card-title-create">2. Create Task</CardTitle>
              <CardDescription>Add a new task (sends email notification)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Buy groceries"
                  data-testid="input-title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Milk, eggs, bread"
                  rows={3}
                  data-testid="input-description"
                />
              </div>
              <Button
                onClick={createTask}
                disabled={!token || !taskTitle}
                className="w-full"
                data-testid="button-create-task"
              >
                <Send className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle data-testid="text-card-title-list">3. List All Tasks</CardTitle>
            <CardDescription>Fetch all tasks for the authenticated user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={getTasks} disabled={!token} data-testid="button-get-tasks">
              <Send className="w-4 h-4 mr-2" />
              Get All Tasks
            </Button>
          </CardContent>
        </Card>

        {response && (
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-card-title-response">API Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto" data-testid="text-response">
                <code>{response}</code>
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle data-testid="text-card-title-docs">API Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">POST /api/generate-token</h3>
              <p className="text-sm text-muted-foreground mb-2">Generate a JWT token for testing</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto">
{`curl -X POST http://localhost:5000/api/generate-token \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com"}'`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">GET /api/tasks</h3>
              <p className="text-sm text-muted-foreground mb-2">Retrieve all tasks (requires JWT)</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto">
{`curl http://localhost:5000/api/tasks \\
  -H "Authorization: Bearer YOUR_TOKEN"`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">POST /api/tasks</h3>
              <p className="text-sm text-muted-foreground mb-2">Create a new task and send email (requires JWT)</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto">
{`curl -X POST http://localhost:5000/api/tasks \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Buy milk","description":"2% whole milk"}'`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
