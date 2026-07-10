import React from "react";
import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface HelpStep {
  icon: string;
  title: string;
  description: string;
}

interface HelpModalProps {
  activityName: string;
  steps: HelpStep[];
  triggerClassName?: string;
}

const HelpModal: React.FC<HelpModalProps> = ({
  activityName,
  steps,
  triggerClassName,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={
            triggerClassName ??
            "p-2 bg-white rounded-full border border-gray-100 shadow-sm active:scale-90 transition-transform"
          }
        >
          <HelpCircle size={16} className="text-gray-400" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-[28px] p-0 overflow-hidden">
        <div className="bg-yellow-400 px-6 py-5">
          <DialogTitle className="text-xl font-black text-gray-800 text-center">
            Cara Bermain
          </DialogTitle>
          <p className="text-sm font-bold text-yellow-800 text-center mt-0.5">
            {activityName}
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center font-black text-sm">
                {step.icon}
              </span>
              <div className="pt-0.5">
                <p className="font-bold text-gray-800 text-sm">{step.title}</p>
                <p className="text-gray-500 text-xs leading-relaxed mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={() => setOpen(false)}
            className="w-full py-3 bg-gray-800 text-white font-black text-sm rounded-2xl active:scale-95 transition-all"
          >
            Mengerti!
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpModal;
