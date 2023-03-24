import createStore from "teaful";


export const tools = {
    SELECT: 1,
    RECTANGLE: 2,
    ELEMENT_PICKER: 3
};

export const { useStore, getStore } = createStore({
    selectedTool: tools.SELECT,
    labels: [{title: "Hello", value: "Hello"}],
    nodes: {}
});
