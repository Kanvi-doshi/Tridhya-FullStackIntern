export default async function Search({ searchParams }) {
    
  return (
    <div>
      <h1>Query: {(await searchParams).query}</h1>
    </div>
  );
}
