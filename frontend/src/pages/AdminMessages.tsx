import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Mail,
  MessageSquare,
  User,
  Calendar,
  Eye,
  RefreshCw,
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from '../hooks/use-toast';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        'http://localhost:5000/api/admin/messages'
      );

      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);

      toast({
        title: 'Error',
        description: 'Failed to load customer messages.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Customer Messages
              </h1>
              <p className="text-gray-600 mt-1">
                View messages submitted through the Contact Us form.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={fetchMessages}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${
                  loading ? 'animate-spin' : ''
                }`}
              />
              Refresh
            </Button>
          </div>

          {/* SUMMARY */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-2xl font-bold">
                      {messages.length}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total Messages
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-yellow-600" />
                  </div>

                  <div>
                    <p className="text-2xl font-bold">
                      {messages.filter(
                        message => message.status === 'unread'
                      ).length}
                    </p>
                    <p className="text-sm text-gray-600">
                      Unread
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-green-600" />
                  </div>

                  <div>
                    <p className="text-2xl font-bold">
                      {messages.filter(
                        message => message.status === 'read'
                      ).length}
                    </p>
                    <p className="text-sm text-gray-600">
                      Read
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* MESSAGES */}
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>

            <CardContent>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
                  <p className="mt-4 text-gray-500">
                    Loading messages...
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="mt-4 text-gray-500">
                    No customer messages yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">

                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className="border rounded-lg p-5 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                        <div className="flex-1">

                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <h3 className="font-semibold text-lg">
                              {message.subject}
                            </h3>

                            <Badge
                              variant={
                                message.status === 'unread'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {message.status}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">

                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {message.name}
                            </span>

                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {message.email}
                            </span>

                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(
                                message.createdAt
                              ).toLocaleDateString()}
                            </span>

                          </div>

                          <p className="text-gray-700 whitespace-pre-wrap">
                            {message.message}
                          </p>

                        </div>

                      </div>
                    </div>
                  ))}

                </div>
              )}

            </CardContent>
          </Card>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminMessages;