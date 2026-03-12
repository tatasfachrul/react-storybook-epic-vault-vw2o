"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Menu,
  X,
  LayoutDashboard,
  Component,
  Shapes,
  ChevronDown,
  ChevronRight,
  Puzzle,
  Atom,
  Sparkle,
  Orbit,
} from "lucide-react";
import rrLogo from "../assets/rr-logo.png";
import DashboardSection from "./sections/DashboardSection";
import CatalogSection from "./sections/CatalogSection";
import DetailSection from "./sections/DetailSection";
import Image from "next/image";

// --- ErrorBoundary ---
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-base">
              {this.state.error}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: "" })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-base"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Types ---
interface PropItem {
  name: string;
  type: string;
  default: string;
  required: boolean;
  description: string;
}
interface ComponentItem {
  id: string;
  name: string;
  description: string;
  category: "particles" | "atoms" | "molecules" | "organisms";
  status: "stable" | "beta" | "new";
  props: PropItem[];
  variants: string[];
  code: string;
  guidelines: string;
  accessibility: string;
  relatedComponents: string[];
}
interface Category {
  id: string;
  name: string;
  description: string;
  count: number;
}
type ViewType = "dashboard" | "catalog" | "detail";

// --- Component Data ---
const COMPONENTS: ComponentItem[] = [
  {
    id: "button",
    name: "Button",
    description:
      "Interactive button element with multiple variants, sizes, and states for triggering actions.",
    category: "atoms",
    status: "stable",
    props: [
      {
        name: "variant",
        type: "'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'",
        default: "primary",
        required: false,
        description: "Visual style variant",
      },
      {
        name: "size",
        type: "'sm' | 'md' | 'lg'",
        default: "md",
        required: false,
        description: "Button size",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        required: false,
        description: "Disable the button",
      },
      {
        name: "loading",
        type: "boolean",
        default: "false",
        required: false,
        description: "Show loading state",
      },
      {
        name: "children",
        type: "string",
        default: "Button",
        required: true,
        description: "Button label text",
      },
    ],
    variants: ["primary", "secondary", "outline", "ghost", "destructive"],
    code: '<Button variant="primary" size="md">Click me</Button>',
    guidelines:
      "Do: Use primary variant for main CTAs.\nDo: Provide clear, action-oriented labels.\nDon't: Use more than one primary button per section.\nDon't: Disable buttons without explaining why.",
    accessibility:
      'Buttons use native <button> element for keyboard support.\nEnsure visible focus ring.\nUse aria-label if text is icon-only.\nDisabled buttons should have aria-disabled="true".',
    relatedComponents: ["Input", "Toggle", "Badge"],
  },
];

const CATEGORIES: Category[] = [
  {
    id: "particles",
    name: "Particles",
    description: "Fundamental building blocks for user interfaces",
    count: COMPONENTS.filter((c) => c.category === "particles").length,
  },
  {
    id: "atoms",
    name: "Atoms",
    description: "Advanced interactive components with rich behavior",
    count: COMPONENTS.filter((c) => c.category === "atoms").length,
  },
  {
    id: "molecules",
    name: "Molecules",
    description: "Structural components for page composition",
    count: COMPONENTS.filter((c) => c.category === "molecules").length,
  },
  {
    id: "organisms",
    name: "Organisms",
    description: "Pre-built patterns for common business use cases",
    count: COMPONENTS.filter((c) => c.category === "organisms").length,
  },
];

const SAMPLE_DATA_COMPONENTS = COMPONENTS;

const categoryIcons: Record<string, React.ReactNode> = {
  particles: <Sparkle className="h-4 w-4" />,
  atoms: <Atom className="h-4 w-4" />,
  molecules: <Orbit className="h-4 w-4" />,
  organisms: <Puzzle className="h-4 w-4" />,
};

// --- Main Page ---
export default function Page() {
  const [view, setView] = useState<ViewType>("dashboard");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null
  );
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [sampleData, setSampleData] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);

  const components = sampleData ? SAMPLE_DATA_COMPONENTS : COMPONENTS;

  const selectedComponent = useMemo(() => {
    if (!selectedComponentId) return null;
    return components.find((c) => c.id === selectedComponentId) ?? null;
  }, [selectedComponentId, components]);

  const handleSelectCategory = useCallback((catId: string) => {
    setSelectedCategory(catId);
    setView("catalog");
    setSidebarOpen(false);
  }, []);

  const handleSelectComponent = useCallback((compId: string) => {
    setSelectedComponentId(compId);
    setView("detail");
    setSidebarOpen(false);
  }, []);

  const handleNavigateByName = useCallback(
    (name: string) => {
      const found = components.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (found) {
        setSelectedComponentId(found.id);
        setView("detail");
      }
    },
    [components]
  );

  const handleBack = useCallback(() => {
    setSelectedComponentId(null);
    setView("catalog");
  }, []);

  const handleGlobalSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (globalSearch.trim()) {
        setSelectedCategory("all");
        setView("catalog");
        setSidebarOpen(false);
      }
    },
    [globalSearch]
  );

  const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: "catalog",
      label: "All Components",
      icon: <Component className="h-4 w-4" />,
    },
  ];

  const viewTitles: Record<ViewType, string> = {
    dashboard: "Dashboard",
    catalog: "Component Catalog",
    detail: selectedComponent?.name ?? "Detail",
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-[hsl(210,20%,97%)] via-[hsl(220,25%,95%)] via-70% to-[hsl(230,15%,97%)] text-[hsl(222,47%,11%)] font-sans">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed top-0 left-0 h-full w-60 bg-[hsl(0,0%,98%)]/90 backdrop-blur-[16px] border-r border-[hsl(214,32%,91%)] z-40 flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        >
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center">
                <Image src={rrLogo} alt="Logo" width={24} height={24} />
              </div>
              <span className="text-base font-semibold tracking-tight">
                RR Design System
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded hover:bg-black/5 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Separator />
          <ScrollArea className="flex-1 px-3 py-3">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id);
                    setSelectedComponentId(null);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === item.id && (item.id !== "catalog" || !selectedComponentId) ? "bg-[hsl(222,47%,11%)]/8 text-[hsl(222,47%,11%)]" : "text-[hsl(215,16%,47%)] hover:bg-black/5 hover:text-[hsl(222,47%,11%)]"}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              <div className="pt-2">
                <button
                  onClick={() => setCategoriesExpanded((p) => !p)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(215,16%,47%)] hover:bg-black/5 hover:text-[hsl(222,47%,11%)] transition-colors"
                >
                  <Shapes className="h-4 w-4" />
                  <span className="flex-1 text-left">Categories</span>
                  {categoriesExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
                {categoriesExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedCategory === cat.id && view === "catalog" ? "bg-[hsl(222,47%,11%)]/8 text-[hsl(222,47%,11%)] font-medium" : "text-[hsl(215,16%,47%)] hover:bg-black/5"}`}
                      >
                        {categoryIcons[cat.id]}
                        <span className="flex-1 text-left">{cat.name}</span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] h-4 px-1.5"
                        >
                          {cat.count}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </ScrollArea>

          <Separator />
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[hsl(215,16%,47%)] font-medium uppercase tracking-wider">
                Sample Data
              </span>
              <Switch checked={sampleData} onCheckedChange={setSampleData} />
            </div>
            <div className="flex items-center gap-2 px-1 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-[hsl(215,16%,47%)]">
                Component Assistant Agent
              </span>
            </div>
          </div>
        </aside>

        <div className="lg:pl-60 min-h-screen flex flex-col">
          <header className="sticky top-0 z-20 bg-[hsl(0,0%,98%)]/80 backdrop-blur-[16px] border-b border-[hsl(214,32%,91%)]">
            <div className="flex items-center gap-4 px-4 md:px-6 py-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg hover:bg-black/5 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h2 className="text-base font-semibold text-[hsl(222,47%,11%)] hidden sm:block">
                {viewTitles[view]}
              </h2>
              <form
                onSubmit={handleGlobalSearch}
                className="flex-1 max-w-md ml-auto relative"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(215,16%,47%)]" />
                <Input
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search components..."
                  className="pl-9 h-8 text-sm bg-white/60 border-[hsl(214,32%,91%)] rounded-lg"
                />
              </form>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto">
            {view === "dashboard" && (
              <DashboardSection
                components={components}
                categories={CATEGORIES}
                onSelectCategory={handleSelectCategory}
                onSelectComponent={handleSelectComponent}
              />
            )}
            {view === "catalog" && (
              <CatalogSection
                components={
                  globalSearch.trim()
                    ? components.filter(
                        (c) =>
                          c.name
                            .toLowerCase()
                            .includes(globalSearch.toLowerCase()) ||
                          c.description
                            .toLowerCase()
                            .includes(globalSearch.toLowerCase())
                      )
                    : components
                }
                initialCategory={selectedCategory}
                onSelectComponent={handleSelectComponent}
              />
            )}
            {view === "detail" && (
              <DetailSection
                component={selectedComponent}
                onBack={handleBack}
                onNavigateToComponent={handleSelectComponent}
                allComponents={components}
              />
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
