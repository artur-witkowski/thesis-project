import { getResults } from "@/app/results/actions";
import { ErrorCard } from "./_components/error-card";
import { ResultsContent } from "./_components/results-content";

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const token = (await searchParams).token;

  if (!token || typeof token !== "string") {
    return (
      <ErrorCard 
        title="Invalid Access" 
        description="No valid access token provided." 
        titleColor="text-red-500" 
      />
    );
  }
  
  const results = await getResults({ accessToken: token });

  if (!results) {
    return (
      <ErrorCard 
        title="No Results Found" 
        description="We couldn&apos;t find any survey results for your session." 
      />
    );
  }

  return <ResultsContent results={results} />;
}
