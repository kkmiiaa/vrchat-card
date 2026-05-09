export default function BalloonToggle({
  showBalloon,
  setShowBalloon,
  t,
}: {
  showBalloon: boolean;
  setShowBalloon: (val: boolean) => void;
  t: any;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-700">{t.showSpeechBubble}</span>
      <button
        role="switch"
        aria-checked={showBalloon}
        onClick={() => setShowBalloon(!showBalloon)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none
          ${showBalloon ? 'bg-gray-900' : 'bg-gray-200'}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform
            ${showBalloon ? 'translate-x-4.5' : 'translate-x-0.5'}`}
        />
      </button>
    </label>
  );
}
