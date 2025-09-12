"use client"

import { useState, useEffect } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { useMultiplayerStore } from '@/lib/multiplayerStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  Shield,
  Users,
  Crown,
  Star,
  Trophy,
  Plus,
  Search,
  Settings,
  MessageCircle,
  Target,
  Award,
  TrendingUp
} from 'lucide-react'

export function ClanSystem() {
  const gameStore = useGameStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateClan, setShowCreateClan] = useState(false)
  const [showJoinClan, setShowJoinClan] = useState(false)
  const [clanName, setClanName] = useState('')
  const [clanDescription, setClanDescription] = useState('')
  const clans = useMultiplayerStore(state => state.clans)
  const createClanAction = useMultiplayerStore(state => state.createClan)
  const requestJoinClan = useMultiplayerStore(state => state.requestJoinClan)

  // Current live clans come from multiplayer store
  const [currentClan, setCurrentClan] = useState<any | null>(null)
  const [clanMembers] = useState<any[]>([])
  const [topClans, setTopClans] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // populate top clans initially from the multiplayer store
    setTopClans(clans.slice(0, 10))
  }, [clans])

  useEffect(() => {
    // set a sensible default current clan when clans load
    if (clans && clans.length > 0) {
      // If currentClan is missing (e.g., after clan deletion) pick the first available
      if (!currentClan) {
        setCurrentClan(clans[0])
      } else {
        // Keep current selection in sync with the clans list (find by id)
        const found = clans.find((c: any) => c.id === currentClan.id)
        if (!found) setCurrentClan(clans[0])
        else setCurrentClan(found)
      }
    } else {
      // No clans available
      setCurrentClan(null)
    }
  }, [clans, currentClan])

  const createClan = () => {
    // Only allow create when player owns at least one land NFT
    if ((gameStore.player.landNFTs || 0) <= 0) {
      toast.error('You must own a Land NFT to create a clan')
      return
    }

    if (clanName.trim() && clanDescription.trim()) {
      createClanAction(clanName.trim(), clanDescription.trim(), gameStore.player.id)
      toast.success(`Clan "${clanName}" created successfully!`)
      setShowCreateClan(false)
      setClanName('')
      setClanDescription('')
    }
  }

  const joinClan = (clanId: string) => {
    requestJoinClan(clanId, gameStore.player.id)
    toast.success('Join request sent!')
    setShowJoinClan(false)
  }

  const OverviewTab = () => (
    !currentClan ? (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>No clan selected</CardTitle>
            <CardDescription>Browse clans in the Leaderboard tab or create a new clan if you own land.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Select a clan to view details.</div>
          </CardContent>
        </Card>
      </div>
    ) : (
      <div className="space-y-6">
        <Card>
              <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {currentClan?.name ?? 'Unnamed Clan'} {currentClan?.tag ?? ''}
            </CardTitle>
            <CardDescription>{currentClan?.description ?? ''}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{currentClan?.level ?? 0}</div>
                <div className="text-sm text-muted-foreground">Clan Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{currentClan?.members ?? 0}</div>
                <div className="text-sm text-muted-foreground">Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{currentClan?.trophies ?? 0}</div>
                <div className="text-sm text-muted-foreground">Trophies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">#{currentClan?.rank ?? '-'}</div>
                <div className="text-sm text-muted-foreground">Global Rank</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Clan XP Progress</span>
                <span>75/100</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clan Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div className="flex-1">
                  <p className="font-semibold">Tournament Victory!</p>
                  <p className="text-sm text-muted-foreground">Clan won the weekly championship</p>
                </div>
                <Badge>+500 XP</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-semibold">New Member Joined</p>
                  <p className="text-sm text-muted-foreground">CoinCollector joined the clan</p>
                </div>
                <Badge>+100 XP</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Target className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-semibold">Clan Goal Achieved</p>
                  <p className="text-sm text-muted-foreground">Reached 1M total wealth milestone</p>
                </div>
                <Badge>+200 XP</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  )

  const MembersTab = () => (
    !currentClan ? (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>No clan selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Select a clan to view members.</div>
          </CardContent>
        </Card>
      </div>
    ) : (
      <div className="space-y-6">
        <Card>
              <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clan Members ({currentClan?.members ?? 0}/{currentClan?.maxMembers ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clanMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{member.avatar}</div>
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant={
                          member.role === 'Leader' ? 'default' :
                          member.role === 'Co-Leader' ? 'secondary' : 'outline'
                        }>
                          {member.role}
                        </Badge>
                        <span>Level {member.level}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${member.contribution.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Contribution</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  )

  const LeaderboardTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Top Clans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topClans.map((clan) => (
              <div key={clan.id ?? clan.rank} className={`flex items-center justify-between p-4 rounded-lg ${
                (currentClan && clan.id === currentClan.id) ? 'bg-primary/10 border border-primary' : 'bg-muted'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                    {clan.rank ?? '-'}
                  </div>
                  <div>
                    <h3 className="font-semibold">{clan.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{clan.members ?? 0} members</span>
                      <span>{clan.trophies ?? 0} trophies</span>
                      <span>Level {clan.level ?? 0}</span>
                    </div>
                  </div>
                </div>
                {currentClan && clan.id === currentClan.id && (
                  <Badge className="bg-primary">Your Clan</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const SettingsTab = () => (
    !currentClan ? (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>No clan selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Select a clan to manage settings.</div>
          </CardContent>
        </Card>
      </div>
    ) : (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Clan Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clan-name">Clan Name</Label>
              <Input id="clan-name" defaultValue={currentClan.name} />
            </div>
            <div>
              <Label htmlFor="clan-description">Description</Label>
              <Textarea id="clan-description" defaultValue={currentClan.description} />
            </div>
            <div>
              <Label htmlFor="clan-tag">Clan Tag</Label>
              <Input id="clan-tag" defaultValue={currentClan.tag} />
            </div>
            <Button className="w-full">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Leader-only: pending join requests */}
        {currentClan.leader === gameStore.player.id && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Join Requests</CardTitle>
              <CardDescription>Approve players requesting to join your clan</CardDescription>
            </CardHeader>
            <CardContent>
              {useMultiplayerStore.getState().joinRequests.filter((r: any) => r.clanId === currentClan.id).length === 0 ? (
                <div className="text-sm text-muted-foreground">No pending requests</div>
              ) : (
                <div className="space-y-2">
                  {useMultiplayerStore.getState().joinRequests.filter((r: any) => r.clanId === currentClan.id).map((req: any) => (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-semibold">{req.username ?? req.playerId}</div>
                        <div className="text-sm text-muted-foreground">Player ID: {req.playerId}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => {
                          useMultiplayerStore.getState().acceptJoinRequest(req.id, currentClan.id)
                          toast.success(`Accepted ${req.username ?? req.playerId}`)
                        }}>
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    )
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => setShowJoinClan(true)}>
          Join Clan
        </Button>
        <Button size="sm" onClick={() => setShowCreateClan(true)} disabled={(gameStore.player.landNFTs || 0) <= 0}>
          Create Clan
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="members">
          <MembersTab />
        </TabsContent>

        <TabsContent value="leaderboard">
          <LeaderboardTab />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>

      {/* Create Clan Dialog */}
      <Dialog open={showCreateClan} onOpenChange={setShowCreateClan}>
        <DialogContent className="sm:max-w-md bg-card border border-border shadow-lg">
          <DialogHeader>
            <DialogTitle>Create New Clan</DialogTitle>
            <DialogDescription>
              Create your own clan and invite other players to join!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-clan-name">Clan Name</Label>
              <Input
                id="new-clan-name"
                placeholder="Enter clan name"
                value={clanName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClanName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-clan-description">Description</Label>
              <Textarea
                id="new-clan-description"
                placeholder="Describe your clan"
                value={clanDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setClanDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createClan} className="flex-1">
                Create Clan (1000 credits)
              </Button>
              <Button variant="outline" onClick={() => setShowCreateClan(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Clan Dialog */}
      <Dialog open={showJoinClan} onOpenChange={setShowJoinClan}>
        <DialogContent className="sm:max-w-md bg-card border border-border shadow-lg">
          <DialogHeader>
            <DialogTitle>Join a Clan</DialogTitle>
            <DialogDescription>
              Browse available clans and send join requests
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search clans..." className="pl-9" />
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(() => {
                  const filtered = clans.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 20)
                  if (filtered.length === 0) return <div className="text-sm text-muted-foreground">No clans found</div>
                  return filtered.map((clan: any) => (
                    <div key={clan.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <h3 className="font-semibold">{clan.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {clan.members ?? 0} members • {clan.trophies ?? 0} trophies
                        </p>
                      </div>
                      <Button size="sm" onClick={() => joinClan(clan.id)}>
                        Join
                      </Button>
                    </div>
                  ))
                })()}
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}