
export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen">
       {/* <NavBar />  */}
      <main className="  px-6 flex-grow pt-2  ">
      
        {children}
      </main>
   
     
    </div>
  );
}