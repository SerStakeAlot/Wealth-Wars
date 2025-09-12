'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Users,
  MessageCircle,
  Send,
  UserPlus,
  Crown,
  Shield,
  Zap,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react'

export default function MultiplayerPanel() {
  const gameStore = useGameStore()
  const [activeTab, setActiveTab] = useState('lobby')
  const [isConnected, setIsConnected] = useState(true)
  const [players, setPlayers] = useState([
    { id: 1, name: 'CryptoKing', level: 25, status: 'online', avatar: '👑' },
    { id: 2, name: 'WealthHunter', level: 22, status: 'online', avatar: '🏹' },
    { id: 3, name: 'EmpireBuilder', level: 28, status: 'away', avatar: '🏰' },
    { id: 4, name: 'MarketMaster', level: 20, status: 'online', avatar: '📈' }
  ])
  const [messages, setMessages] = useState([
    { id: 1, player: 'CryptoKing', message: 'Anyone up for a battle?', time: '2m ago' },
    { id: 2, player: 'WealthHunter', message: 'Just hit level 22! 🎉', time: '5m ago' },
    { id: 3, player: 'EmpireBuilder', message: 'Looking for trade partners', time: '10m ago' }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        player: 'You',
        message: newMessage,
        time: 'now'
      }
      setMessages([message, ...messages])
      setNewMessage('')
      toast.success('Message sent!')
    }
  }

  const invitePlayer = (playerId: number) => {
    const player = players.find(p => p.id === playerId)
    toast.success(`Invitation sent to ${player?.name}!`)
    setShowInviteDialog(false)
  }

  const LobbyView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Game Lobby
          </CardTitle>
          <CardDescription>
            Connect with other players and join multiplayer activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="h-24 flex flex-col gap-2" size="lg">
              <Zap className="h-6 w-6" />
              <span>Quick Match</span>
              <span className="text-sm opacity-75">Find opponents fast</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2" size="lg">
              <Users className="h-6 w-6" />
              <span>Custom Game</span>
              <span className="text-sm opacity-75">Create your own rules</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Online Players ({players.filter(p => p.status === 'online').length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {players.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{player.avatar}</div>
                  <div>
                    <h3 className="font-semibold">{player.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Level {player.level}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        player.status === 'online' ? 'bg-green-500' :
                        player.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <span className="capitalize">{player.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowInviteDialog(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button size="sm">
                    Challenge
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const ChatView = () => (
    <div className="space-y-6">
      <Card className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Global Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {msg.player.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{msg.player}</span>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button onClick={sendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const StatsView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">1,247</p>
            <p className="text-sm text-muted-foreground">Total Players</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">342</p>
            <p className="text-sm text-muted-foreground">Active Now</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">89</p>
            <p className="text-sm text-muted-foreground">Tournaments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Multiplayer Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-xl font-bold">47</div>
              <div className="text-sm text-muted-foreground">Games Played</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-xl font-bold">68%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-xl font-bold">1,250</div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-xl font-bold">2,340</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {isConnected ? 'Connected to multiplayer' : 'Disconnected'}
              </span>
            </div>
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lobby">Lobby</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="lobby">
          <LobbyView />
        </TabsContent>

        <TabsContent value="chat">
          <ChatView />
        </TabsContent>

        <TabsContent value="stats">
          <StatsView />
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="bg-card border border-border shadow-lg">
          <DialogHeader>
            <DialogTitle>Invite Player</DialogTitle>
            <DialogDescription>
              Send an invitation to join your game or clan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-message">Message</Label>
              <Textarea
                id="invite-message"
                placeholder="Hey! Want to join my game?"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => invitePlayer(1)} className="flex-1">
                Send Invite
              </Button>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}