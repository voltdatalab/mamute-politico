import logoMamute from '@/assets/logo-mamute.png';

export function SelecaoFooter() {
  return (
    <div className="relative flex h-[185px] items-center bg-[#447b55]">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-8 px-2 text-[12px] font-medium text-[#ffffff] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)] md:flex-row">
          <img src={logoMamute} alt="Mamute Político" className="h-[30px] w-auto self-start brightness-0 invert" />
          <span>© 2024 Mamute Político. Dados obtidos via API aberta do Congresso Nacional.</span>
        </div>
      </div>
    </div>
  );
}
