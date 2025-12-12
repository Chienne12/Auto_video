import { Button } from "@/components/ui/button";

interface RatioOption {
  id: number | string;
  label: string;
  value: string;
}

interface PropsData {
  ratioOptions: RatioOption[];
  ratio: string;
  setRatio: (ratio: string) => void;
}

const CropRatio = ({ ratioOptions, ratio, setRatio }: PropsData) => {
  return (
    <div className="flex w-full flex-col items-center justify-center space-y-2">
      <div className="text-md flex space-x-2">
        {ratioOptions.map((it) => (
          <Button
            variant={it.value === ratio ? "default" : "outline"}
            size={"sm"}
            key={it.label}
            onClick={() => setRatio(it.value)}
          >
            {it.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CropRatio;
