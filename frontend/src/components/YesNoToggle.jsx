function YesNoToggle({ value, onChange, disabled }) {
  const isYes = value === "Y";

  return (
    <button
      type="button"
      onClick={() => onChange(isYes ? "N" : "Y")}
      disabled={disabled}
      className={`w-28 text-center px-4 py-1 rounded-lg transition-all duration-300 font-medium ${
        isYes
          ? "bg-green-600 hover:bg-green-700 text-white"
          : "bg-red-500 hover:bg-red-600 text-white"
      }`}
    >
      {isYes ? "Yes" : "No"}
    </button>
  );
}

export default YesNoToggle;
