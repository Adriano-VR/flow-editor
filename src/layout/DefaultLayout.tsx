import NavBar from "@/components/Navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen font-mono ">
       <NavBar /> 
      <main className="  px-6 flex-grow pt-2 ">
      
        {children}
      </main>
   
     
    </div>
  );
}