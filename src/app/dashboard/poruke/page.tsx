"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  ArrowLeft,
  MessageCircle,
  Car,
  Search,
  MoreVertical,
  Check,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage,
  markAsRead,
  getUserProfile,
} from "@/lib/firestore";

interface ConversationData {
  id: string;
  participants: string[];
  listingId: string;
  listingTitle: string;
  listingPhoto: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: Record<string, number>;
}

interface MessageData {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date;
  read: boolean;
}

interface ParticipantInfo {
  displayName: string;
  initials: string;
  photoURL?: string | null;
}

function formatMessageTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) {
    return date.toLocaleTimeString("bs-BA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (days === 1) return "Jucer";
  if (days < 7) {
    const dayNames = ["Ned", "Pon", "Uto", "Sri", "Cet", "Pet", "Sub"];
    return dayNames[date.getDay()];
  }
  return date.toLocaleDateString("bs-BA", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default function PorukePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [participantInfoMap, setParticipantInfoMap] = useState<Record<string, ParticipantInfo>>({});

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/prijava");
    }
  }, [authLoading, user, router]);

  // Subscribe to conversations (real-time)
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToConversations(user.uid, (convs) => {
      setConversations(convs);
      setLoadingConversations(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch participant info for all conversations
  useEffect(() => {
    if (!user || conversations.length === 0) return;

    const fetchParticipants = async () => {
      const newInfoMap: Record<string, ParticipantInfo> = {};

      for (const conv of conversations) {
        const otherUid = conv.participants.find((p) => p !== user.uid);
        if (!otherUid || participantInfoMap[otherUid]) continue;

        try {
          const profile = await getUserProfile(otherUid);
          if (profile) {
            const displayName = (profile.displayName as string) || "Korisnik";
            const nameParts = displayName.split(" ");
            const initials = nameParts
              .map((n) => n.charAt(0))
              .join("")
              .toUpperCase()
              .slice(0, 2);
            newInfoMap[otherUid] = {
              displayName,
              initials: initials || "?",
              photoURL: (profile.photoURL as string) || null,
            };
          } else {
            newInfoMap[otherUid] = {
              displayName: "Korisnik",
              initials: "?",
            };
          }
        } catch {
          newInfoMap[otherUid] = {
            displayName: "Korisnik",
            initials: "?",
          };
        }
      }

      if (Object.keys(newInfoMap).length > 0) {
        setParticipantInfoMap((prev) => ({ ...prev, ...newInfoMap }));
      }
    };

    fetchParticipants();
  }, [user, conversations, participantInfoMap]);

  // Subscribe to messages for selected conversation (real-time)
  useEffect(() => {
    if (!selectedConvId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);

    const unsubscribe = subscribeToMessages(selectedConvId, (msgs) => {
      setMessages(msgs);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [selectedConvId]);

  // Mark as read when opening a conversation
  useEffect(() => {
    if (!user || !selectedConvId) return;

    const conv = conversations.find((c) => c.id === selectedConvId);
    if (conv && (conv.unreadCount[user.uid] || 0) > 0) {
      markAsRead(selectedConvId, user.uid).catch(console.error);
    }
  }, [selectedConvId, user, conversations]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get other participant info for a conversation
  const getOtherParticipant = useCallback(
    (conv: ConversationData): ParticipantInfo => {
      if (!user) return { displayName: "Korisnik", initials: "?" };
      const otherUid = conv.participants.find((p) => p !== user.uid);
      if (otherUid && participantInfoMap[otherUid]) {
        return participantInfoMap[otherUid];
      }
      return { displayName: "Korisnik", initials: "?" };
    },
    [user, participantInfoMap]
  );

  // Send a message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !user || !selectedConvId) return;

    const conv = conversations.find((c) => c.id === selectedConvId);
    if (!conv) return;

    const otherUid = conv.participants.find((p) => p !== user.uid);
    if (!otherUid) return;

    const text = messageInput.trim();
    setMessageInput("");

    try {
      setSending(true);
      await sendMessage(
        user.uid,
        otherUid,
        conv.listingId,
        conv.listingTitle,
        conv.listingPhoto || "",
        text
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore the input if sending failed
      setMessageInput(text);
    } finally {
      setSending(false);
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  const filteredConversations = conversations.filter((c) => {
    const participant = getOtherParticipant(c);
    return (
      participant.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.listingTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Loading / auth guard
  if (authLoading || !user) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Poruke</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Komunikacija sa zainteresovanim kupcima
        </p>
      </div>

      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden h-[calc(100vh-16rem)] lg:h-[calc(100vh-14rem)] flex">
        {/* Conversation List */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-[var(--border)] flex flex-col",
            selectedConvId ? "hidden md:flex" : "flex"
          )}
        >
          {/* Search */}
          <div className="p-3 border-b border-[var(--border)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Pretrazi poruke..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="flex items-center justify-center h-full py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                <MessageCircle className="w-12 h-12 text-[var(--muted-foreground)] opacity-30 mb-3" />
                <p className="text-sm text-[var(--muted-foreground)] font-medium text-center">
                  Nemate poruka
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 text-center">
                  Poruke ce se pojaviti kada vas neko kontaktira
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const participant = getOtherParticipant(conv);
                const isSelected = selectedConvId === conv.id;
                const unread = conv.unreadCount[user.uid] || 0;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 text-left transition-colors duration-150 border-b border-[var(--border)]",
                      isSelected
                        ? "bg-accent-50 dark:bg-accent-500/10"
                        : "hover:bg-[var(--muted)]"
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold",
                        unread > 0
                          ? "bg-accent-500 text-white"
                          : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                      )}
                    >
                      {participant.initials}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "text-sm truncate",
                            unread > 0
                              ? "font-bold text-[var(--foreground)]"
                              : "font-medium text-[var(--foreground)]"
                          )}
                        >
                          {participant.displayName}
                        </span>
                        <span className="text-[10px] text-[var(--muted-foreground)] flex-shrink-0">
                          {formatMessageTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-accent-500 truncate mt-0.5">
                        {conv.listingTitle}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p
                          className={cn(
                            "text-xs truncate",
                            unread > 0
                              ? "font-medium text-[var(--foreground)]"
                              : "text-[var(--muted-foreground)]"
                          )}
                        >
                          {conv.lastMessage}
                        </p>
                        {unread > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-accent-500 rounded-full flex-shrink-0">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={cn(
            "flex-1 flex flex-col",
            selectedConvId ? "flex" : "hidden md:flex"
          )}
        >
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--background)]">
                <button
                  onClick={() => setSelectedConvId(null)}
                  className="md:hidden p-1.5 -ml-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div
                  className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                >
                  {getOtherParticipant(selectedConv).initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                    {getOtherParticipant(selectedConv).displayName}
                  </p>
                  <p className="text-xs text-accent-500 truncate flex items-center gap-1">
                    <Car className="w-3 h-3" />
                    {selectedConv.listingTitle}
                  </p>
                </div>
                <button className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Listing Reference */}
                <div className="flex justify-center mb-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--muted)] rounded-full text-xs text-[var(--muted-foreground)]">
                    <Car className="w-3.5 h-3.5" />
                    Razgovor o: {selectedConv.listingTitle}
                  </div>
                </div>

                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-accent-500" />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === user.uid;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                            isOwn
                              ? "bg-accent-500 text-white rounded-br-md"
                              : "bg-[var(--muted)] text-[var(--foreground)] rounded-bl-md"
                          )}
                        >
                          <p>{msg.text}</p>
                          <div
                            className={cn(
                              "flex items-center justify-end gap-1 mt-1",
                              isOwn ? "text-white/60" : "text-[var(--muted-foreground)]"
                            )}
                          >
                            <span className="text-[10px]">
                              {msg.createdAt.toLocaleTimeString("bs-BA", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isOwn &&
                              (msg.read ? (
                                <CheckCheck className="w-3.5 h-3.5" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 border-t border-[var(--border)] bg-[var(--background)]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Napisite poruku..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    disabled={sending}
                    className="flex-1 px-4 py-3 text-sm bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sending}
                    className={cn(
                      "p-3 rounded-xl transition-all duration-200 flex-shrink-0",
                      messageInput.trim() && !sending
                        ? "bg-accent-500 text-white hover:bg-accent-600 shadow-lg shadow-accent-500/25"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed"
                    )}
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Empty State - No conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="w-20 h-20 rounded-2xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-accent-500 opacity-60" />
              </div>
              <p className="text-base font-semibold text-[var(--foreground)]">
                Odaberite razgovor
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1 text-center max-w-sm">
                Izaberite razgovor sa lijeve strane da biste vidjeli poruke
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
