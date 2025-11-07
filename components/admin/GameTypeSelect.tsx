"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

type GameTypeSelectProps = {
  onSelect: (gameType: string) => void;
};

export const GameTypeSelect: React.FC<GameTypeSelectProps> = ({ onSelect }) => {
  const games = [
    { id: "Apex", name: "Apex Legends", image: "/games/apex.jpg" },
    { id: "Minecraft", name: "Minecraft", image: "/games/minecraft.webp" },
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      {games.map((game) => (
        <Button
          key={game.id}
          onClick={() => onSelect(game.id)}
          variant="ghost"
          className="group relative aspect-video overflow-hidden rounded-lg border-2 border-white/10 bg-white/5 transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:scale-105 cursor-pointer h-auto p-0"
        >
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 z-10" />
          <Image
            src={game.image}
            alt={game.name}
            fill
            className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent z-20" />
          <div className="absolute bottom-0 left-0 right-0 p-4 z-30">
            <h3 className="text-2xl font-bold text-white">{game.name}</h3>
          </div>
        </Button>
      ))}
    </div>
  );
};
