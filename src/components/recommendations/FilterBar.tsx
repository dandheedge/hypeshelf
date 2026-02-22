import { Button } from "@/components/ui/button";
import { GenreOptions } from "@/lib/schemas";

interface FilterBarProps {
  selectedGenre: string | undefined;
  onGenreChange: (genre: string | undefined) => void;
}

export function FilterBar({ selectedGenre, onGenreChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={selectedGenre === undefined ? "default" : "outline"}
        size="sm"
        onClick={() => onGenreChange(undefined)}
      >
        All
      </Button>
      {GenreOptions.map((option) => (
        <Button
          key={option.value}
          variant={selectedGenre === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onGenreChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
