import React, {
  type ReactNode,
  createContext,
  useContext,
  useState,
} from 'react';

export type LoadingItem = {
  key: string;
  message?: string;
};

export type LoadingState = {
  isLoading: boolean;
  loadingItems: LoadingItem[];
  currentMessage?: string;
  startLoading: (key: string, message?: string) => void;
  endLoading: (key: string) => void;
};

const LoadingContext = createContext<LoadingState | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [loadingItems, setLoadingItems] = useState<LoadingItem[]>([]);

  const startLoading = (key: string, message: string = '처리 중입니다...') => {
    setLoadingItems((prev) => [...prev, { key, message }]);
  };

  const MIN_LOADING_TIME = 150;

  const endLoading = (key: string) => {
    setTimeout(() => {
      setLoadingItems((prev) => prev.filter((item) => item.key !== key));
    }, MIN_LOADING_TIME);
  };

  const isLoading = loadingItems.length > 0;
  const currentMessage = loadingItems[loadingItems.length - 1]?.message;

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingItems,
        currentMessage,
        startLoading,
        endLoading,
      }}
    >
      <div
        className={`w-full h-full transition-all duration-200 ${
          isLoading ? 'blur-sm' : ''
        }`}
      >
        {children}
      </div>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="w-screen h-screen fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70 transition-opacity duration-200">
          <div className="flex flex-col gap-6 items-center">
            {/* 로딩 스피너 */}
            <div className="relative w-16 h-16">
              <div className="absolute w-8 h-8 top-0 left-0 bg-indigo-400 rounded-full animate-ping"></div>
              <div
                className="absolute w-8 h-8 bottom-0 right-0 bg-indigo-600 rounded-full animate-ping"
                style={{
                  animationDelay: '0.5s',
                  animationFillMode: 'backwards',
                }}
              ></div>
            </div>

            {/* 로딩 메시지 */}
            {currentMessage && (
              <div className="text-lg font-medium text-gray-700 text-center whitespace-pre-line">
                {currentMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingState => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
