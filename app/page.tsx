"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineBars3,
  HiOutlineXMark,
} from "react-icons/hi2";
import {
  TbLayoutDashboard,
  TbComponents,
  TbCategory,
  TbDatabase,
  TbMessageChatbot,
  TbChevronDown,
  TbChevronRight,
  TbCube,
  TbPuzzle,
  TbLayout,
  TbBriefcase,
} from "react-icons/tb";

import DashboardSection from "./sections/DashboardSection";
import CatalogSection from "./sections/CatalogSection";
import DetailSection from "./sections/DetailSection";

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
            <p className="text-muted-foreground mb-4 text-sm">
              {this.state.error}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: "" })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
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
  category: "basic" | "complex" | "layout" | "domain";
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
    category: "basic",
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

  {
    id: "input",
    name: "Input",
    description:
      "Text input field for forms with support for various types, placeholders, and validation states.",
    category: "basic",
    status: "stable",
    props: [
      {
        name: "type",
        type: "'text' | 'email' | 'password' | 'number'",
        default: "text",
        required: false,
        description: "HTML input type",
      },
      {
        name: "placeholder",
        type: "string",
        default: "",
        required: false,
        description: "Placeholder text",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        required: false,
        description: "Disable the input",
      },
      {
        name: "size",
        type: "'sm' | 'md' | 'lg'",
        default: "md",
        required: false,
        description: "Input size",
      },
    ],
    variants: ["default", "error", "success"],
    code: '<Input type="text" placeholder="Enter value..." />',
    guidelines:
      "Do: Always pair with a visible label.\nDo: Show validation messages below the field.\nDon't: Use placeholder as the only label.\nDon't: Disable without providing context.",
    accessibility:
      'Use htmlFor to associate labels with inputs.\nProvide aria-describedby for help text.\nError states need aria-invalid="true".',
    relatedComponents: ["Button", "Select", "Combobox"],
  },

  {
    id: "badge",
    name: "Badge",
    description:
      "Small status indicator or label component for categorization, counts, or status display.",
    category: "basic",
    status: "stable",
    props: [
      {
        name: "variant",
        type: "'default' | 'success' | 'warning' | 'error' | 'info'",
        default: "default",
        required: false,
        description: "Color variant",
      },
      {
        name: "children",
        type: "string",
        default: "Badge",
        required: true,
        description: "Badge text content",
      },
    ],
    variants: ["default", "success", "warning", "error", "info"],
    code: '<Badge variant="success">Active</Badge>',
    guidelines:
      "Do: Keep text short (1-2 words).\nDo: Use consistent colors for the same status.\nDon't: Use badges for long text.\nDon't: Overuse badges in a single view.",
    accessibility:
      "Add aria-label if the badge conveys important status.\nDon't rely solely on color to convey meaning.",
    relatedComponents: ["Button", "Avatar", "StatCard"],
  },

  {
    id: "avatar",
    name: "Avatar",
    description:
      "User avatar component displaying initials or images with multiple size options.",
    category: "basic",
    status: "stable",
    props: [
      {
        name: "initials",
        type: "string",
        default: "AZ",
        required: false,
        description: "Initials to display",
      },
      {
        name: "size",
        type: "'sm' | 'md' | 'lg'",
        default: "md",
        required: false,
        description: "Avatar size",
      },
    ],
    variants: ["default", "rounded"],
    code: '<Avatar initials="JD" size="md" />',
    guidelines:
      "Do: Use 2-letter initials.\nDo: Provide alt text for image avatars.\nDon't: Use very long text in avatars.",
    accessibility:
      'Provide role="img" and aria-label with the user name.\nDeclarative avatars should be aria-hidden if name is shown alongside.',
    relatedComponents: ["UserProfile", "Badge"],
  },

  {
    id: "toggle",
    name: "Toggle",
    description:
      "On/off toggle switch for binary settings and boolean preferences.",
    category: "basic",
    status: "stable",
    props: [
      {
        name: "checked",
        type: "boolean",
        default: "false",
        required: false,
        description: "Current toggle state",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        required: false,
        description: "Disable the toggle",
      },
    ],
    variants: ["default"],
    code: "<Toggle checked={true} onChange={handleChange} />",
    guidelines:
      "Do: Use for immediate on/off settings.\nDo: Clearly label what the toggle controls.\nDon't: Use for actions that require confirmation.\nDon't: Use when a checkbox is more appropriate.",
    accessibility:
      'Uses role="switch" with aria-checked.\nEnsure keyboard toggling via Space/Enter.\nProvide visible label associated with aria-labelledby.',
    relatedComponents: ["Button", "Input"],
  },

  {
    id: "tooltip",
    name: "Tooltip",
    description:
      "Contextual hover tooltip providing additional information about an element.",
    category: "basic",
    status: "new",
    props: [
      {
        name: "content",
        type: "string",
        default: "Tooltip text",
        required: true,
        description: "Tooltip content text",
      },
      {
        name: "position",
        type: "'top' | 'bottom' | 'left' | 'right'",
        default: "top",
        required: false,
        description: "Tooltip position",
      },
    ],
    variants: ["default", "info"],
    code: '<Tooltip content="More info">Hover me</Tooltip>',
    guidelines:
      "Do: Use for supplementary information.\nDo: Keep tooltip text concise.\nDon't: Put interactive elements in tooltips.\nDon't: Rely on tooltips for essential information.",
    accessibility:
      'Use aria-describedby linking tooltip to trigger.\nEnsure keyboard focus can trigger the tooltip.\nTooltip should have role="tooltip".',
    relatedComponents: ["Button", "Badge"],
  },

  {
    id: "datatable",
    name: "DataTable",
    description:
      "Full-featured data table with sorting, pagination, row selection, and customizable columns.",
    category: "complex",
    status: "stable",
    props: [
      {
        name: "columns",
        type: "number",
        default: "3",
        required: false,
        description: "Number of columns",
      },
      {
        name: "sortable",
        type: "boolean",
        default: "true",
        required: false,
        description: "Enable column sorting",
      },
      {
        name: "selectable",
        type: "boolean",
        default: "false",
        required: false,
        description: "Enable row selection",
      },
      {
        name: "paginated",
        type: "boolean",
        default: "true",
        required: false,
        description: "Enable pagination",
      },
    ],
    variants: ["default", "striped", "compact"],
    code: "<DataTable columns={columns} data={data} sortable paginated />",
    guidelines:
      "Do: Provide clear column headers.\nDo: Use pagination for large datasets.\nDon't: Render more than 100 rows without virtualization.\nDon't: Make all columns sortable if not needed.",
    accessibility:
      "Use semantic <table>, <thead>, <tbody> elements.\nSortable columns need aria-sort.\nRow selection needs aria-selected.\nPagination controls need aria-label.",
    relatedComponents: ["Select", "Input", "Badge"],
  },

  {
    id: "select",
    name: "Select",
    description:
      "Dropdown select component for choosing from a predefined list of options.",
    category: "complex",
    status: "stable",
    props: [
      {
        name: "placeholder",
        type: "string",
        default: "Select option...",
        required: false,
        description: "Placeholder when no option is selected",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        required: false,
        description: "Disable the select",
      },
      {
        name: "searchable",
        type: "boolean",
        default: "false",
        required: false,
        description: "Enable search/filter within options",
      },
    ],
    variants: ["default", "multi"],
    code: '<Select placeholder="Choose...">\n  <SelectItem value="a">Option A</SelectItem>\n</Select>',
    guidelines:
      "Do: Provide a clear placeholder.\nDo: Use for 5+ options (use radio for fewer).\nDon't: Nest selects within each other.\nDon't: Use for navigation.",
    accessibility:
      "Uses listbox pattern with arrow key navigation.\nSelected option announced via aria-selected.\nLabel required via aria-label or visible label.",
    relatedComponents: ["Input", "Combobox", "DatePicker"],
  },

  {
    id: "datepicker",
    name: "DatePicker",
    description:
      "Calendar-based date selection component with support for ranges and constraints.",
    category: "complex",
    status: "beta",
    props: [
      {
        name: "placeholder",
        type: "string",
        default: "Pick a date...",
        required: false,
        description: "Placeholder text",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        required: false,
        description: "Disable the picker",
      },
    ],
    variants: ["default", "range"],
    code: '<DatePicker placeholder="Select date" onChange={setDate} />',
    guidelines:
      "Do: Show the expected date format.\nDo: Allow manual text input as alternative.\nDon't: Restrict date ranges without explanation.\nDon't: Use for time-only inputs.",
    accessibility:
      'Calendar grid uses role="grid" with arrow key navigation.\nSelected date announced to screen readers.\nProvide clear labels for month/year navigation buttons.',
    relatedComponents: ["Input", "Select"],
  },

  {
    id: "combobox",
    name: "Combobox",
    description:
      "Searchable dropdown combining text input with selectable options list.",
    category: "complex",
    status: "beta",
    props: [
      {
        name: "placeholder",
        type: "string",
        default: "Search...",
        required: false,
        description: "Search input placeholder",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        required: false,
        description: "Disable the combobox",
      },
    ],
    variants: ["default", "multi"],
    code: '<Combobox placeholder="Search items..." options={items} />',
    guidelines:
      "Do: Use for large option lists (20+).\nDo: Show clear \"no results\" state.\nDon't: Use when options are fewer than 5.\nDon't: Make search case-sensitive.",
    accessibility:
      "Uses combobox ARIA pattern.\nOption list filterable via keyboard.\nAnnounce number of matching results.\nSupport typeahead selection.",
    relatedComponents: ["Select", "Input", "DataTable"],
  },

  {
    id: "card",
    name: "Card",
    description:
      "Versatile container component for grouping related content with header, body, and footer.",
    category: "layout",
    status: "stable",
    props: [
      {
        name: "title",
        type: "string",
        default: "Card Title",
        required: false,
        description: "Card header title",
      },
      {
        name: "children",
        type: "string",
        default: "Card content",
        required: true,
        description: "Card body content",
      },
    ],
    variants: ["default", "bordered", "elevated"],
    code: "<Card>\n  <CardHeader>Title</CardHeader>\n  <CardContent>Body</CardContent>\n</Card>",
    guidelines:
      "Do: Use cards to group related information.\nDo: Keep card content concise.\nDon't: Nest cards deeply (max 1 level).\nDon't: Overload a single card with too many actions.",
    accessibility:
      "Use article element or region role if card is a standalone unit.\nCard actions should be keyboard accessible.\nInteractive cards need focus styles.",
    relatedComponents: ["Dialog", "Tabs", "StatCard"],
  },

  {
    id: "dialog",
    name: "Dialog",
    description:
      "Modal dialog overlay for confirmations, forms, and focused user interactions.",
    category: "layout",
    status: "stable",
    props: [
      {
        name: "title",
        type: "string",
        default: "Dialog Title",
        required: true,
        description: "Dialog header title",
      },
      {
        name: "children",
        type: "string",
        default: "Dialog content",
        required: true,
        description: "Dialog body content",
      },
    ],
    variants: ["default", "destructive"],
    code: "<Dialog>\n  <DialogTrigger>Open</DialogTrigger>\n  <DialogContent>...</DialogContent>\n</Dialog>",
    guidelines:
      "Do: Focus on a single task per dialog.\nDo: Provide clear cancel/close actions.\nDon't: Stack multiple dialogs.\nDon't: Use for non-critical information.",
    accessibility:
      'Traps focus within the dialog when open.\nEsc key closes the dialog.\nReturn focus to trigger element on close.\nUse aria-modal="true" and role="dialog".',
    relatedComponents: ["Card", "Button"],
  },

  {
    id: "tabs",
    name: "Tabs",
    description:
      "Tabbed navigation component for organizing content into switchable panels.",
    category: "layout",
    status: "stable",
    props: [
      {
        name: "defaultValue",
        type: "string",
        default: "tab1",
        required: false,
        description: "Default active tab",
      },
    ],
    variants: ["default", "underline", "pill"],
    code: '<Tabs defaultValue="tab1">\n  <TabsList>\n    <TabsTrigger value="tab1">Tab 1</TabsTrigger>\n  </TabsList>\n  <TabsContent value="tab1">Content</TabsContent>\n</Tabs>',
    guidelines:
      "Do: Use for 2-6 related content sections.\nDo: Keep tab labels short.\nDon't: Use tabs for sequential steps (use stepper).\nDon't: Hide critical content in secondary tabs.",
    accessibility:
      "Uses tablist/tab/tabpanel ARIA pattern.\nArrow keys navigate between tabs.\nTab content should be associated via aria-labelledby.\nProvide aria-selected on active tab.",
    relatedComponents: ["Card", "Dialog"],
  },

  {
    id: "userprofile",
    name: "UserProfile",
    description:
      "User profile card showing avatar, name, role, and contact details.",
    category: "domain",
    status: "new",
    props: [
      {
        name: "name",
        type: "string",
        default: "Jane Doe",
        required: true,
        description: "User display name",
      },
      {
        name: "role",
        type: "string",
        default: "Product Designer",
        required: false,
        description: "User role or title",
      },
    ],
    variants: ["default", "compact"],
    code: '<UserProfile name="Jane Doe" role="Designer" />',
    guidelines:
      "Do: Show the most important info first.\nDo: Use real avatar images when available.\nDon't: Display sensitive information without consent.\nDon't: Overcrowd with too many fields.",
    accessibility:
      "Use semantic heading for the user name.\nAvatar should have alt text.\nLinks should be clearly labeled.",
    relatedComponents: ["Avatar", "Card", "Badge"],
  },

  {
    id: "pricingcard",
    name: "PricingCard",
    description:
      "Pricing tier card for SaaS products displaying plan details, price, and feature list.",
    category: "domain",
    status: "beta",
    props: [
      {
        name: "tier",
        type: "string",
        default: "Pro",
        required: true,
        description: "Plan tier name",
      },
      {
        name: "price",
        type: "string",
        default: "29",
        required: true,
        description: "Monthly price",
      },
    ],
    variants: ["default", "highlighted"],
    code: '<PricingCard tier="Pro" price="29" features={features} />',
    guidelines:
      "Do: Highlight the recommended plan.\nDo: List features with clear check/cross icons.\nDon't: Hide important limitations.\nDon't: Use too many pricing tiers (3-4 max).",
    accessibility:
      "Use semantic list for features.\nHighlighted plan needs aria-label describing it as recommended.\nCTA buttons need descriptive labels.",
    relatedComponents: ["Card", "Button", "Badge"],
  },

  {
    id: "statcard",
    name: "StatCard",
    description:
      "Metric display card for dashboards showing a label, value, and trend indicator.",
    category: "domain",
    status: "new",
    props: [
      {
        name: "label",
        type: "string",
        default: "Revenue",
        required: true,
        description: "Stat label",
      },
      {
        name: "value",
        type: "string",
        default: "$12,345",
        required: true,
        description: "Display value",
      },
      {
        name: "change",
        type: "string",
        default: "+12.5%",
        required: false,
        description: "Change percentage",
      },
    ],
    variants: ["default", "compact"],
    code: '<StatCard label="Revenue" value="$12,345" change="+12.5%" />',
    guidelines:
      "Do: Show the metric label above the value.\nDo: Color-code positive/negative trends.\nDon't: Show too many stats without grouping.\nDon't: Use vague labels.",
    accessibility:
      'Use aria-label to describe the full stat meaning.\nColor-coded trends should also use text/icon indicators.\nGroup related stats with role="group".',
    relatedComponents: ["Card", "Badge"],
  },
];

const CATEGORIES: Category[] = [
  {
    id: "basic",
    name: "Basic UI",
    description: "Fundamental building blocks for user interfaces",
    count: COMPONENTS.filter((c) => c.category === "basic").length,
  },
  {
    id: "complex",
    name: "Complex",
    description: "Advanced interactive components with rich behavior",
    count: COMPONENTS.filter((c) => c.category === "complex").length,
  },
  {
    id: "layout",
    name: "Layout",
    description: "Structural components for page composition",
    count: COMPONENTS.filter((c) => c.category === "layout").length,
  },
  {
    id: "domain",
    name: "Domain",
    description: "Pre-built patterns for common business use cases",
    count: COMPONENTS.filter((c) => c.category === "domain").length,
  },
];

const SAMPLE_DATA_COMPONENTS = COMPONENTS;

const categoryIcons: Record<string, React.ReactNode> = {
  basic: <TbCube className="h-4 w-4" />,
  complex: <TbPuzzle className="h-4 w-4" />,
  layout: <TbLayout className="h-4 w-4" />,
  domain: <TbBriefcase className="h-4 w-4" />,
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
      icon: <TbLayoutDashboard className="h-4 w-4" />,
    },
    {
      id: "catalog",
      label: "All Components",
      icon: <TbComponents className="h-4 w-4" />,
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
              <div className="w-7 h-7 rounded-lg bg-[hsl(222,47%,11%)] flex items-center justify-center">
                <TbComponents className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-tight">
                ComponentVault
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded hover:bg-black/5 lg:hidden"
            >
              <HiOutlineXMark className="h-4 w-4" />
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
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${view === item.id && (item.id !== "catalog" || !selectedComponentId) ? "bg-[hsl(222,47%,11%)]/8 text-[hsl(222,47%,11%)]" : "text-[hsl(215,16%,47%)] hover:bg-black/5 hover:text-[hsl(222,47%,11%)]"}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              <div className="pt-2">
                <button
                  onClick={() => setCategoriesExpanded((p) => !p)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[hsl(215,16%,47%)] hover:bg-black/5 hover:text-[hsl(222,47%,11%)] transition-colors"
                >
                  <TbCategory className="h-4 w-4" />
                  <span className="flex-1 text-left">Categories</span>
                  {categoriesExpanded ? (
                    <TbChevronDown className="h-3 w-3" />
                  ) : (
                    <TbChevronRight className="h-3 w-3" />
                  )}
                </button>
                {categoriesExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${selectedCategory === cat.id && view === "catalog" ? "bg-[hsl(222,47%,11%)]/8 text-[hsl(222,47%,11%)] font-medium" : "text-[hsl(215,16%,47%)] hover:bg-black/5"}`}
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
                <HiOutlineBars3 className="h-5 w-5" />
              </button>
              <h2 className="text-sm font-semibold text-[hsl(222,47%,11%)] hidden sm:block">
                {viewTitles[view]}
              </h2>
              <form
                onSubmit={handleGlobalSearch}
                className="flex-1 max-w-md ml-auto relative"
              >
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(215,16%,47%)]" />
                <Input
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search components..."
                  className="pl-9 h-8 text-xs bg-white/60 border-[hsl(214,32%,91%)] rounded-lg"
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

        <button
          onClick={() => setAssistantOpen(true)}
          className="fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-[hsl(222,47%,11%)] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
          aria-label="Open AI Assistant"
        >
          <TbMessageChatbot className="h-5 w-5" />
        </button>
      </div>
    </ErrorBoundary>
  );
}
