import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import {
    Search as SearchIcon,
    Film,
    Tv,
    List,
    Database,
    Zap,
    Code2,
    Box,
    Database as DbIcon,
    Palette,
} from "lucide-react"
import Link from "next/link"

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <nav className="border-b fixed w-full bg-background/90 backdrop-blur z-50 shadow-md">
                <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                        MovieDB
                    </span>
                    <div className="flex items-center gap-6">
                        <a href="/form" className="text-sm font-medium hover:text-primary transition-colors">
                            Form
                        </a>
                        <a href="/search" className="text-sm font-medium hover:text-primary transition-colors">
                            Demo
                        </a>
                        <ModeToggle />
                    </div>
                </div>
            </nav>
            <section className="pt-32 pb-24 bg-gradient-to-b from-primary/10 to-background">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                        Advanced Movie & TV Series Search Engine
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                        Powerful search platform built with modern tech stack featuring real-time search, caching, and
                        intelligent matching algorithms.
                    </p>
                    <div className="flex gap-6 justify-center">
                        <Link href="/search">
                            <Button size="lg" variant="outline" className="hover:bg-primary/10">
                                <SearchIcon className="mr-2 h-5 w-5" />
                                Try Demo
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
            <section id="features" className="py-24 bg-muted/50">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <h2 className="text-3xl font-extrabold text-center mb-16">Key Features</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-lg border bg-card hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section id="tech" className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <h2 className="text-3xl font-extrabold text-center mb-16">Built With Modern Tech Stack</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {techStack.map((tech, i) => (
                            <div key={i} className="text-center p-6">
                                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-primary/10">
                                    {tech.icon}
                                </div>
                                <h3 className="font-semibold">{tech.name}</h3>
                                <p className="text-sm text-muted-foreground">{tech.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <footer className="border-t py-12 bg-muted/50">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-bold mb-4">MovieDB</h3>
                            <p className="text-sm text-muted-foreground">
                                Advanced search engine for movies and TV series built with modern technologies.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Links</h3>
                            <div className="space-y-2">
                                <a href="#features" className="block text-sm hover:text-primary transition-colors">
                                    Features
                                </a>
                                <a href="#demo" className="block text-sm hover:text-primary transition-colors">
                                    Demo
                                </a>
                                <a href="#tech" className="block text-sm hover:text-primary transition-colors">
                                    Tech Stack
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Connect</h3>
                            <div className="space-y-2">
                                <a
                                    href="https://github.com"
                                    className="block text-sm hover:text-primary transition-colors"
                                >
                                    GitHub
                                </a>
                                <a href="#" className="block text-sm hover:text-primary transition-colors">
                                    Documentation
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                        © 2024 MovieDB. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}

const features = [
    {
        icon: <SearchIcon className="w-8 h-8 text-primary" />,
        title: "Intelligent Search",
        description: "Advanced search algorithm with Jaccard similarity for better matches.",
    },
    {
        icon: <Film className="w-8 h-8 text-primary" />,
        title: "Movies Database",
        description: "Comprehensive collection of movies with detailed information.",
    },
    {
        icon: <Tv className="w-8 h-8 text-primary" />,
        title: "TV Series",
        description: "Complete TV series database with episode listings.",
    },
    {
        icon: <Database className="w-8 h-8 text-primary" />,
        title: "Redis Caching",
        description: "Fast response times with intelligent caching system.",
    },
    {
        icon: <List className="w-8 h-8 text-primary" />,
        title: "Categorized Results",
        description: "Well-organized results by type for better navigation.",
    },
    {
        icon: <Zap className="w-8 h-8 text-primary" />,
        title: "Real-time Updates",
        description: "Instant search results as you type.",
    },
]

const techStack = [
    {
        icon: <Code2 className="w-8 h-8 text-primary" />,
        name: "Next.js",
        description: "React Framework.",
    },
    {
        icon: <Box className="w-8 h-8 text-primary" />,
        name: "Prisma",
        description: "Database ORM.",
    },
    {
        icon: <DbIcon className="w-8 h-8 text-primary" />,
        name: "Redis",
        description: "Caching Layer.",
    },
    {
        icon: <Palette className="w-8 h-8 text-primary" />,
        name: "Tailwind CSS",
        description: "Styling.",
    },
]
