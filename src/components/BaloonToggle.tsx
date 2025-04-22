export default function BalloonToggle({
    showBalloon,
    setShowBalloon,
  }: {
    showBalloon: boolean;
    setShowBalloon: (val: boolean) => void;
  }) {
    return (
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={showBalloon}
            onChange={(e) => setShowBalloon(e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          吹き出しを表示する
        </label>
      </div>
    );
  }