import type { Metadata } from "next";
import { supportedLanguages } from "@/features/Lang/lang";
import { generateMetadataInfo } from "@/libs/metadata";
import { getBlogs } from "@/features/Blog/blogData";
import { BlogOnePage } from "@/features/Blog/BlogOnePage";

interface BlogProps {
  id: string;
  lang: string;
}

export async function generateStaticParams() {
  const { blogs } = getBlogs("en");
  return supportedLanguages
    .map((lang: string) => {
      return blogs.map((item) => {
        return { id: item.id, lang };
      });
    })
    .flat();
}

interface PageProps {
  params: Promise<BlogProps>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateMetadataInfo({
    lang: (await props.params).lang,
    blogId: (await props.params).id,
    currentPath: "blog",
  });
}

export default async function BlogOneFullPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";

  return (
    <html lang={supportedLang}>
      <body>
        <BlogOnePage id={id} lang={supportedLang} />
      </body>
    </html>
  );
}
