import React from "react"; // Imports the React library to create components

// TODO: Replace with a shadcn scroll area or data table

/**
 * A component that displays a list of selected files, with the ability to remove
 * them.
 *
 * @param {array} selectedFiles - The list of files that have been selected.
 * @param {function} setSelectedFiles - The function to set the list of selected files.
 * @returns {ReactElement} The rendered component.
 */
const ParseDataSelectedViewer = ({ selectedFiles, setSelectedFiles }) => {
  return (
    <>
      <div className="w-full max-w-1/2 h-full bg-[#929292] border-8 border-[#2B2B2B] rounded-xl overflow-y-scroll">
        <ul>
          {/* Loops over each file in selectedFiles and creates a list item */}
          {selectedFiles.map((file, index) => (
            <li key={index}>
              <div className="flex items-center justify-between border-b-2 border-[#2B2B2B]">
                {/* Displays the file name */}
                <span style={{ fontSize: "2.5dvh", marginLeft: "0.64dvw" }}>
                  {file.name}
                </span>

                {/* Displays a clickable 'x' button for removing the file */}
                <button
                  type="button"
                  className="text-2xl mr-2 text-red-500 font-bold"
                  onClick={() => {
                    // Filters out the clicked file from the list
                    setSelectedFiles(
                      selectedFiles.filter((file, i) => i !== index)
                    );
                  }}
                >
                  x
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default ParseDataSelectedViewer;
