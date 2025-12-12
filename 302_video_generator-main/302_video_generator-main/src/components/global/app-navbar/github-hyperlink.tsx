import Image from "next/image";

import { useTheme } from "next-themes";
import githubMarkWhite from "public/svgs/github-mark-white.svg";
import githubMark from "public/svgs/github-mark.svg";

import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { cn } from "@/lib/utils";
import { useStore } from "@/stores/store";

interface GithubHyperlinkProps {
  className?: string;
}

export function GithubHyperlink({ className }: GithubHyperlinkProps) {
  const { showBrand } = useStore();
  const { theme } = useTheme();

  const githubRepoUrl = env.NEXT_PUBLIC_GITHUB_REPO_URL;

  const shouldShowBrand = showBrand === "true";

  return (
    <a
      href={githubRepoUrl}
      target="_blank"
      className={cn(
        githubRepoUrl && shouldShowBrand ? "block" : "hidden",
        className
      )}
      rel="noreferrer"
    >
      <Button variant="icon" size="roundIconSm">
        <Image
          className="size-4"
          src={theme === "dark" ? githubMarkWhite : githubMark}
          alt="GitHub"
          width={16}
          height={16}
        />
      </Button>
    </a>
  );
}
