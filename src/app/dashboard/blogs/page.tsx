"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Heart,
  Brain,
  User,
  Shield,
  Clock,
  BookOpen,
  Filter,
  Calendar,
  Tag,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category:
    | "mental-health"
    | "women-health"
    | "general-health"
    | "terminal-diseases"
    | "nutrition"
    | "fitness";
  tags: string[];
  readTime: number;
  publishedDate: string;
  steps: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Understanding Anxiety Disorders: Recognition and Management",
    excerpt:
      "Learn to identify anxiety symptoms and develop effective coping strategies for daily life.",
    content:
      "Anxiety disorders are among the most common mental health conditions, affecting millions worldwide. Understanding the signs and learning management techniques can significantly improve quality of life.",
    category: "mental-health",
    tags: ["anxiety", "mental-health", "coping", "therapy"],
    readTime: 8,
    publishedDate: "2025-08-01",
    steps: [
      "Recognize physical symptoms: rapid heartbeat, sweating, trembling",
      "Identify triggers and patterns in your anxiety responses",
      "Practice deep breathing exercises for 5-10 minutes daily",
      "Implement progressive muscle relaxation techniques",
      "Establish a regular sleep schedule and maintain good sleep hygiene",
      "Consider professional therapy or counseling",
      "Explore medication options with a healthcare provider if needed",
    ],
  },
  {
    id: "2",
    title: "PCOS: A Comprehensive Guide for Women",
    excerpt:
      "Everything you need to know about Polycystic Ovary Syndrome, from symptoms to treatment options.",
    content:
      "Polycystic Ovary Syndrome (PCOS) affects 1 in 10 women of reproductive age. Understanding this condition is crucial for proper management and maintaining overall health.",
    category: "women-health",
    tags: ["PCOS", "hormones", "women", "reproductive-health"],
    readTime: 12,
    publishedDate: "2025-07-28",
    steps: [
      "Monitor menstrual cycles and note irregularities",
      "Track symptoms like excessive hair growth, acne, weight gain",
      "Consult a gynecologist for proper diagnosis",
      "Get blood tests for hormone levels and insulin resistance",
      "Adopt a low-glycemic index diet to manage insulin levels",
      "Incorporate regular exercise, especially strength training",
      "Consider medications like metformin or birth control as prescribed",
      "Join support groups for emotional support and tips",
    ],
  },
  {
    id: "3",
    title: "Heart Health: Prevention and Early Detection",
    excerpt:
      "Essential steps to maintain cardiovascular health and recognize warning signs of heart disease.",
    content:
      "Heart disease remains the leading cause of death globally. However, many cases are preventable through lifestyle changes and early detection.",
    category: "general-health",
    tags: ["heart-health", "cardiovascular", "prevention", "lifestyle"],
    readTime: 10,
    publishedDate: "2025-07-25",
    steps: [
      "Monitor blood pressure regularly at home",
      "Check cholesterol levels annually",
      "Maintain a healthy weight through balanced diet",
      "Exercise for at least 150 minutes per week",
      "Quit smoking and limit alcohol consumption",
      "Manage stress through relaxation techniques",
      "Get adequate sleep (7-9 hours nightly)",
      "Schedule regular check-ups with your doctor",
    ],
  },
  {
    id: "4",
    title: "Living with Chronic Illness: A Comprehensive Guide",
    excerpt:
      "Strategies for managing life with chronic conditions while maintaining quality of life.",
    content:
      "Chronic illnesses can be overwhelming, but with the right approach, it's possible to live a fulfilling life while managing your condition effectively.",
    category: "terminal-diseases",
    tags: ["chronic-illness", "management", "quality-of-life", "support"],
    readTime: 15,
    publishedDate: "2025-07-22",
    steps: [
      "Accept the diagnosis and allow yourself to grieve",
      "Build a strong healthcare team you trust",
      "Learn everything you can about your condition",
      "Create a daily routine that accommodates your energy levels",
      "Maintain social connections and seek support",
      "Focus on nutrition and gentle, appropriate exercise",
      "Practice mindfulness and stress-reduction techniques",
      "Plan for both good and difficult days",
      "Consider joining patient advocacy groups",
    ],
  },
  {
    id: "5",
    title: "Depression: Breaking the Silence and Finding Help",
    excerpt:
      "Understanding depression symptoms and taking actionable steps toward recovery and mental wellness.",
    content:
      "Depression is more than just feeling sad. It's a serious mental health condition that requires understanding, compassion, and proper treatment.",
    category: "mental-health",
    tags: ["depression", "mental-health", "therapy", "support"],
    readTime: 11,
    publishedDate: "2025-07-20",
    steps: [
      "Recognize symptoms: persistent sadness, loss of interest, fatigue",
      "Reach out to a mental health professional",
      "Maintain a daily routine even when it feels difficult",
      "Engage in physical activity, even light walking",
      "Connect with trusted friends and family members",
      "Practice good sleep hygiene",
      "Consider medication if recommended by a doctor",
      "Join support groups or therapy sessions",
      "Be patient with the recovery process",
    ],
  },
  {
    id: "6",
    title: "Menopause: Navigating the Transition with Confidence",
    excerpt:
      "A complete guide to understanding menopause symptoms and management strategies.",
    content:
      "Menopause is a natural biological process that every woman experiences. Understanding what to expect can help you navigate this transition more comfortably.",
    category: "women-health",
    tags: ["menopause", "hormones", "women", "aging"],
    readTime: 9,
    publishedDate: "2025-07-18",
    steps: [
      "Track your menstrual cycle and note changes",
      "Monitor symptoms like hot flashes, mood changes, sleep disturbances",
      "Discuss hormone replacement therapy options with your doctor",
      "Maintain a healthy diet rich in calcium and vitamin D",
      "Stay physically active with weight-bearing exercises",
      "Practice stress management techniques",
      "Consider natural remedies like herbal supplements",
      "Join menopause support groups for shared experiences",
    ],
  },
  {
    id: "7",
    title: "Building a Strong Immune System Naturally",
    excerpt:
      "Science-based approaches to boost your immunity through lifestyle choices and natural methods.",
    content:
      "A strong immune system is your body's first line of defense against illness. Learn how to support and strengthen your natural immunity.",
    category: "general-health",
    tags: ["immunity", "nutrition", "lifestyle", "wellness"],
    readTime: 7,
    publishedDate: "2025-07-15",
    steps: [
      "Eat a diverse diet rich in fruits and vegetables",
      "Get adequate sleep consistently (7-9 hours)",
      "Exercise regularly but avoid overtraining",
      "Manage stress through meditation or yoga",
      "Stay hydrated throughout the day",
      "Limit processed foods and added sugars",
      "Consider probiotic foods for gut health",
      "Maintain good hygiene practices",
      "Get recommended vaccinations",
    ],
  },
  {
    id: "8",
    title: "Cancer Prevention: Evidence-Based Lifestyle Changes",
    excerpt:
      "Research-backed strategies to reduce cancer risk through dietary and lifestyle modifications.",
    content:
      "While not all cancers are preventable, research shows that many cases can be avoided through lifestyle modifications and early screening.",
    category: "terminal-diseases",
    tags: ["cancer", "prevention", "screening", "lifestyle"],
    readTime: 13,
    publishedDate: "2025-07-12",
    steps: [
      "Follow recommended screening guidelines for your age",
      "Maintain a healthy weight through diet and exercise",
      "Limit processed and red meat consumption",
      "Increase intake of fruits, vegetables, and whole grains",
      "Avoid tobacco in all forms",
      "Limit alcohol consumption",
      "Protect your skin from excessive sun exposure",
      "Stay physically active with regular exercise",
      "Consider genetic counseling if you have family history",
    ],
  },
];

const categories = [
  { id: "all", label: "All Topics", icon: BookOpen },
  { id: "mental-health", label: "Mental Health", icon: Brain },
  { id: "women-health", label: "Women's Health", icon: Heart },
  { id: "general-health", label: "General Health", icon: User },
  { id: "terminal-diseases", label: "Chronic Conditions", icon: Shield },
  { id: "nutrition", label: "Nutrition", icon: User },
  { id: "fitness", label: "Fitness", icon: User },
];

export default function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    blogPosts.forEach((post) => {
      post.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  // Filter posts based on search, category, and tags
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "all" || post.category === selectedCategory;
      const matchesTag =
        selectedTag === "all" || post.tags.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [searchTerm, selectedCategory, selectedTag]);

  const handlePostClick = (post: BlogPost) => {
    setSelectedPost(post);
  };

  const handleBackToList = () => {
    setSelectedPost(null);
  };

  if (selectedPost) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Button variant="outline" onClick={handleBackToList} className="mb-6">
          ← Back to Articles
        </Button>

        <article className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(selectedPost.publishedDate).toLocaleDateString()}
              <Clock className="h-4 w-4 ml-4" />
              {selectedPost.readTime} min read
            </div>

            <h1 className="text-4xl font-bold tracking-tight">
              {selectedPost.title}
            </h1>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {selectedPost.category.replace("-", " ")}
              </Badge>
              {selectedPost.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-lg text-muted-foreground mb-8">
              {selectedPost.excerpt}
            </p>
            <p className="mb-8">{selectedPost.content}</p>

            <h2 className="text-2xl font-semibold mb-4">
              Step-by-Step Action Plan
            </h2>
            <div className="space-y-4">
              {selectedPost.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <p className="flex-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Disclaimer:</strong> This article is for informational
              purposes only and is not intended as medical advice. Always
              consult with qualified healthcare professionals before making
              decisions about your health.
            </p>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Health & Wellness Blog
          </h1>
          <p className="text-muted-foreground mt-2">
            Expert insights and practical guidance on mental health, women's
            health, and general wellness
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-[200px]">
              <Tag className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                No articles found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handlePostClick(post)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="capitalize">
                        {post.category.replace("-", " ")}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {post.readTime} min
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedDate).toLocaleDateString()}
                      </div>
                      <Button variant="ghost" size="sm">
                        Read More →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
