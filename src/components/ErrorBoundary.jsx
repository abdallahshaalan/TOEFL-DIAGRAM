import React from "react";
import { Button } from "@/components/ui/button";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Error" };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", {
      message: error?.message || String(error),
      stack: error?.stack || null,
      componentStack: info?.componentStack || null,
    });
  }

  render() {
    if (this.state.hasError) {
      const lang = document.documentElement.lang === "ar" ? "ar" : "en";
      const title = lang === "ar" ? "حدث خطأ ما" : "Something went wrong";
      const home = lang === "ar" ? "العودة للرئيسية" : "Go home";
      return (
        <div className="mx-auto max-w-lg rounded-lg border bg-card p-8 text-center">
          <h2 className="text-page-title">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{this.state.message}</p>
          <Button className="mt-4" onClick={() => window.location.assign("/")}>
            {home}
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
