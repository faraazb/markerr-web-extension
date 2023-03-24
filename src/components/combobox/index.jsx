import { useEffect, useReducer, useRef, useState } from "preact/hooks";
import { useCombobox } from "downshift";
import { useStore } from "../../store";

function getBooksFilter(inputValue) {
    const lowerCasedInputValue = inputValue.toLowerCase();

    return function booksFilter(book) {
        return (
            !inputValue ||
            book.title.toLowerCase().includes(lowerCasedInputValue) ||
            book.author.toLowerCase().includes(lowerCasedInputValue)
        );
    };
}

const Combobox = (props) => {
    const {
        items,
        setItems,
        setSelectedItem,
        getFilter,
        allowCreation = false,
        classNames,
    } = props;
    // TODO unused classnames props
    const { inputClassName, menuClassName, menuItemClassName } = classNames;
    const [filteredItems, setFilteredItems] = useState(items || []);

    const {
        isOpen,
        getToggleButtonProps,
        getLabelProps,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        selectedItem,
    } = useCombobox({
        items: filteredItems,
        onSelectedItemChange: ({ selectedItem }) => {
            setSelectedItem(selectedItem);
        },
        onInputValueChange: ({ inputValue }) => {
            setFilteredItems(items.filter(getFilter(inputValue)));
        },
        itemToString(item) {
            return item ? item.title : "";
        },
        stateReducer: (state, actionAndChanges) => {
            const { type, changes } = actionAndChanges;
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter: {
                    // doesn't log when user has focus on the input, only when focus is on menu
                    const { highlightedIndex, inputValue } = changes;
                    // if no existing option is highlighted
                    if (highlightedIndex === -1 && allowCreation) {
                        addItem({ title: inputValue, value: inputValue });
                    }
                    const canvasContainer = document.getElementById("markerr-canvas-container");
                    if (canvasContainer) {
                        canvasContainer.focus();
                    }
                    return changes;
                }
                default: {
                    return changes;
                }
            }
        },
    });

    const addItem = (item) => {
        if (items.some((existingItem) => existingItem.value === item.value)) {
            return false;
        }
        setItems((prevItems) => [...prevItems, item]);
        return true;
    };

    return (
        <div className="markerr-combobox">
            <input
                className={`markerr-combobox__input${
                    inputClassName ? " " + inputClassName : ""
                }`}
                type="text"
                placeholder="Add a label"
                {...getInputProps()}
                // onKeyDown={handleInputKeydown}
            />
            <ul
                {...getMenuProps()}
                className="markerr-combobox__menu"
                style={{ display: isOpen ? "block" : "none" }}
                data-open={isOpen}
            >
                {isOpen && filteredItems.length === 0 ? (
                    allowCreation ? (
                        <div className="markerr-combobox__menu-message">
                            Press enter to create
                        </div>
                    ) : (
                        <div className="markerr-combobox__menu-message--disabled">
                            No options
                        </div>
                    )
                ) : (
                    isOpen &&
                    filteredItems.map((item, index) => (
                        <li
                            className={`markerr-combobox__item${
                                highlightedIndex === index ? " highlight" : ""
                            }`}
                            {...getItemProps({ item, index })}
                            key={`${item.value}${item.index}`}
                        >
                            {item.title}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

const LabelCombobox = (props) => {
    // const { items = [], setItems, getFilter, allowCreation = false } = props;
    const { setLabelTitle } = props;
    const [value, setValue] = useState({ title: "", value: "" });
    const [labels, setLabels] = useStore.labels();

    function getLabelsFilter(inputValue) {
        const lowerCasedInputValue = inputValue.toLowerCase();
        return function ({ title, _value }) {
            return (
                !inputValue ||
                title.toLowerCase().includes(lowerCasedInputValue)
            );
        };
    }

    useEffect(() => {
        setLabelTitle(value.title);
    }, [value]);

    return (
        <Combobox
            items={labels}
            setItems={setLabels}
            setSelectedItem={setValue}
            getFilter={getLabelsFilter}
            allowCreation={true}
            classNames={{ inputClassName: "markerr-annotation-label" }}
        />
    );
};

export default Combobox;
export { LabelCombobox };
