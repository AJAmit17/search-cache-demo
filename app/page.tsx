import Search from "@/components/search"
import { ModeToggle } from "@/components/mode-toogle"

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-end mb-4">
          <ModeToggle />
        </div>
        <h1 className="text-3xl font-bold text-center mb-8 text-foreground">
          Movie & TV Series Search
        </h1>
        <Search />
      </div>
    </main>
  )
}