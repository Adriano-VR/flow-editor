
export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen font-mono ">
      {/* <NavBar /> */}
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-10 ">
      
        {children}
      </main>
   
     
    </div>
  );
}