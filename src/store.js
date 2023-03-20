import createStore from "teaful";


export const tools = {
    SELECT: 1,
    RECTANGLE: 2,
    ELEMENT_PICKER: 3
};

export const { useStore } = createStore({
    selectedTool: tools.SELECT
});
