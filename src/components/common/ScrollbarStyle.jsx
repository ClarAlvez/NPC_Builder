export default function ScrollbarStyle() {
  return (
    <style>{`
      *::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }

      *::-webkit-scrollbar-track {
        background: transparent;
      }

      *::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #52525b, #27272a);
        border-radius: 9999px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }

      *::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #71717a, #3f3f46);
        border: 2px solid transparent;
        background-clip: padding-box;
      }
    `}</style>
  )
}