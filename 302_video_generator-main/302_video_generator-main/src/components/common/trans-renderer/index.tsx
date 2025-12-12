import { Trans } from "react-i18next";

import { useDomain } from "@/hooks/global";

type TransRendererProps = {
  transKey?: string;
  content?: string;
  website?: string;
};

const TransRenderer = ({
  transKey = "",
  content = "",
  website,
}: TransRendererProps) => {
  const defaultWebsite = useDomain();
  const HOST_NAME = "302.AI";
  return (
    <Trans
      i18nKey={transKey}
      defaults={
        content.replace(HOST_NAME, `<site>${HOST_NAME}</site>`) ||
        "<bold>welcome</bold> <italic>to</italic> <site>{{name}}</site>"
      }
      values={{ name: HOST_NAME }}
      components={{
        italic: <i />,
        bold: <strong />,
        site: (
          <a
            href={website || defaultWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          />
        ),
      }}
    />
  );
};

export default TransRenderer;
