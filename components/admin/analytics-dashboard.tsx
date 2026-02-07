'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, Video, TrendingUp } from 'lucide-react'
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'
import { adminApi } from '@/lib/api'

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

export default function AnalyticsDashboard() {
    const [filter, setFilter] = useState('7d')
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchStats = async (selectedFilter: string) => {
        try {
            setLoading(true)
            const res = await adminApi.getDashboard(selectedFilter)
            if (res.success && res.data) {
                setStats(res.data)
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats(filter)
    }, [filter])

    if (loading) {
        return <div className="p-8 text-center">Loading analytics...</div>
    }

    if (!stats) {
        return <div className="p-8 text-center">No analytics data available</div>
    }

    const filterLabels: Record<string, string> = {
        'today': 'Today',
        'yesterday': 'Yesterday',
        '7d': 'Last 7 Days',
        '30d': 'Last 30 Days',
        'month': 'This Month',
        'year': 'This Year',
        'all': 'All Time'
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="text-sm text-muted-foreground">
                Showing data for: <span className="font-semibold">{filterLabels[filter] || filter}</span>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalViews?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.totalVisitors?.toLocaleString() || 0} unique visitors
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Video Plays</CardTitle>
                        <Video className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalVideoPlays?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.topVideos?.length || 0} videos tracked
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.totalVisitors
                                ? ((stats.totalViews / stats.totalVisitors) || 0).toFixed(1)
                                : '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            pages per visitor
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Traffic Over Time */}
            <Card>
                <CardHeader>
                    <CardTitle>Traffic Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats?.daily || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="visitors"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    name="Unique Visitors"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="views"
                                    stroke="hsl(var(--chart-2))"
                                    strokeWidth={2}
                                    name="Page Views"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Top Pages */}
            <Card>
                <CardHeader>
                    <CardTitle>Most Visited Pages</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {(stats?.topPages || []).slice(0, 10).map((page: any, i: number) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                                    {i + 1}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">{page.title || 'Untitled'}</p>
                                    <p className="text-xs text-muted-foreground">{page.path}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">{page.views?.toLocaleString()} views</div>
                                    <div className="text-xs text-muted-foreground">{page.unique_visitors?.toLocaleString()} unique</div>
                                </div>
                            </div>
                        ))}
                        {(!stats?.topPages || stats.topPages.length === 0) && (
                            <p className="text-sm text-muted-foreground">No page data available yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Video Engagement & Hourly Traffic */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Video Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.videoPlays || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                    />
                                    <Bar
                                        dataKey="plays"
                                        fill="hsl(var(--chart-3))"
                                        radius={[4, 4, 0, 0]}
                                        name="Video Plays"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Traffic by Hour</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.hourlyTraffic || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="hour"
                                        tickFormatter={(hour) => `${hour}:00`}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        labelFormatter={(hour) => `${hour}:00 - ${hour}:59`}
                                    />
                                    <Bar
                                        dataKey="views"
                                        fill="hsl(var(--chart-4))"
                                        radius={[4, 4, 0, 0]}
                                        name="Page Views"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Device Stats & Content Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Device Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats?.deviceStats || []}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="views"
                                    >
                                        {(stats?.deviceStats || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Content Type Interest</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(stats?.contentTypes || []).map((type: any, i: number) => {
                                const maxViews = Math.max(...(stats?.contentTypes || []).map((t: any) => t.views || 0))
                                const percentage = maxViews > 0 ? ((type.views / maxViews) * 100) : 0
                                return (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium capitalize">{type.content_type}</span>
                                            <span className="text-sm text-muted-foreground">{type.views} views</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                            {(!stats?.contentTypes || stats.contentTypes.length === 0) && (
                                <p className="text-sm text-muted-foreground">No content type data available yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Language Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle>Language Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(stats?.languages || []).map((lang: any, i: number) => (
                            <div key={i} className="flex flex-col items-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold">{lang.count}</div>
                                <div className="text-sm text-muted-foreground capitalize">{lang.language}</div>
                            </div>
                        ))}
                        {(!stats?.languages || stats.languages.length === 0) && (
                            <p className="text-sm text-muted-foreground col-span-full">No language data available yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
