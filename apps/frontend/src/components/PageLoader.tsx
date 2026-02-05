import { Loader2 } from 'lucide-react';

export const PageLoader = () => (
  <div className="min-h-[80vh] flex items-center justify-center">
    <Loader2 className="animate-spin text-purple-500" size={40} />
  </div>
);

export default PageLoader;
