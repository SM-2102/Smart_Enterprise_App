function YesNoToggle({ form, setForm, disabled }) {
  const toggleStatus = () => {
    setForm((prev) => ({
      ...prev,
      gst: prev.gst === "Y" ? "N" : "Y",
    }));
  };

  const isCompleted = form.gst === "Y";

  return (
    <button
      id="final_status"
      type="button"
      onClick={toggleStatus}
      disabled={disabled}
      className={`w-28 text-center px-4 py-1 rounded-lg transition-all duration-300 font-medium ${
        isCompleted
          ? "bg-green-600 hover:bg-green-700 text-white"
          : "bg-red-500 hover:bg-red-600 text-white"
      }`}
    >
      {isCompleted ? "Yes" : "No"}
    </button>
  );
}

export default YesNoToggle;
