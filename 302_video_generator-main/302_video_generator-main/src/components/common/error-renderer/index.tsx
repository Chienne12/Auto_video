/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

import { InfoIcon } from "lucide-react";

import TransRenderer from "@/components/common/trans-renderer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useClientTranslation } from "@/hooks/global";
import { langToCountry } from "@/lib/utils";
import { useAppStore } from "@/stores";

interface ErrorRendererProps {
  info?: any;
}

function ErrorRenderer({ info }: ErrorRendererProps) {
  const [content, setContent] = useState("");
  const language = useAppStore((state) => state.language);
  const { t } = useClientTranslation();

  useEffect(() => {
    if (info) {
      let msg = "";
      if (typeof info === "string") {
        msg = info;
      }
      if (typeof info === "object") {
        if (info.message) {
          msg = info.message;
        }
        if (info.error) {
          msg = info.error.message;
          if (language && language !== "en") {
            msg = info.error[`message_${langToCountry(language)}`];
          }
        }
      }

      setContent(msg || "Unknow Error");
    }
  }, [info, language]);

  return (
    <Alert variant="destructive">
      <InfoIcon className="h-4 w-4" />
      <AlertTitle className="text-md">{t("global:system.error")}</AlertTitle>
      <AlertDescription className="text-sm">
        <TransRenderer content={content} />
      </AlertDescription>
    </Alert>
  );
}

export default ErrorRenderer;
