"use client";

import Link from "next/link";
import Image from "next/image";
import { Activity, Zap, BarChart3, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./scroll-reveal";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Grid background - darker in center, fading at corners */}
      <div className="fixed inset-0 grid-bg-vignette pointer-events-none z-0" aria-hidden />
      {/* Vertical margin lines */}
      <div className="fixed left-0 top-0 bottom-0 w-px bg-border/80 z-10" />
      <div className="fixed right-0 top-0 bottom-0 w-px bg-border/80 z-10" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-8 py-4 max-w-6xl mx-auto">
            <Link href="/" className="font-semibold text-lg flex items-center gap-2">
              <Activity className="size-5" />
              API Latency Tracker
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center px-8 py-24 md:py-32">
          <div className="absolute left-0 right-0 bottom-0 h-px bg-border" />
          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground mb-6">
                <Activity className="size-4" />
                API Monitoring for Developers
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-center md:gap-4 mb-6">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  Track latency.
                  <br />
                  <span className="text-muted-foreground">Stay ahead.</span>
                </h1>
                <div className="flex shrink-0 w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 items-center justify-center mt-4 md:mt-0 md:ml-2">
                  <Image
                    src="/vintage-tv.png"
                    alt="Vintage TV"
                    width={160}
                    height={160}
                    className="object-contain w-full h-full"
                    priority
                  />
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Monitor your API endpoints in real-time. Get latency charts,
                uptime stats, and alerts when things go wrong — all from one
                dashboard.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <Link href="/register">
                <Button size="lg" className="text-base px-8 py-6">
                  Get Started
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* Section 2 */}
        <section className="relative px-8 py-24 md:py-32">
          <div className="absolute left-0 right-0 bottom-0 h-px bg-border" />
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                No more guessing about API health
              </h2>
              <p className="text-muted-foreground text-lg mb-12">
                Add your endpoints once. We ping them at your chosen interval and
                keep a history of every response. See trends, spot regressions,
                and catch outages before your users do.
              </p>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-8">
              <ScrollReveal delay={100}>
                <div className="rounded-lg border border-border p-6 bg-card/50">
                  <Zap className="size-10 text-primary mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Automated checks</h3>
                  <p className="text-muted-foreground">
                    Configurable intervals from 30 seconds to 30 minutes. Retry
                    logic on failure. GET, POST, or HEAD — your choice.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <div className="rounded-lg border border-border p-6 bg-card/50">
                  <BarChart3 className="size-10 text-primary mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Latency charts</h3>
                  <p className="text-muted-foreground">
                    Visualize response times over 1h, 24h, 7d, or 30d. p50, p95,
                    p99 percentiles. Uptime percentage at a glance.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="relative px-8 py-24 md:py-32">
          <div className="absolute left-0 right-0 bottom-0 h-px bg-border" />
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                Built for developers
              </h2>
              <p className="text-muted-foreground text-lg mb-12">
                Lightweight, self-hostable, and focused. No enterprise bloat. No
                complex setup. Just add your endpoints and monitor.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="rounded-lg border border-border p-6 bg-card/50">
                <div className="flex items-start gap-4">
                  <Bell className="size-10 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Smart alerts</h3>
                    <p className="text-muted-foreground mb-4">
                      Know when endpoints go down or latency exceeds your
                      threshold. DEGRADED status when response times spike.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Email alerts coming in Phase 2. For now, check the
                      dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative px-8 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                Ready to monitor your APIs?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Free to start. Up to 10 endpoints. No credit card required.
              </p>
              <Link href="/register">
                <Button size="lg" className="text-base px-8 py-6">
                  Get Started
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-6 px-8">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              API Latency Tracker — Monitor your endpoints, one dashboard.
            </p>
            <div className="flex gap-6">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sign up
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
