const initialStore = {
    details: [
        {
            id: '1',
            width: '300',
            height: '400',
            amount: '1'
        },
        {
            id: '2',
            width: '200',
            height: '150',
            amount: '1'
        },
        {
            id: '3',
            width: '300',
            height: '300',
            amount: '1'
        },
        {
            id: '4',
            width: '50',
            height: '200',
            amount: '1'
        },
        {
            id: '5',
            width: '50',
            height: '150',
            amount: '1'
        },
        {
            id: '6',
            width: '50',
            height: '150',
            amount: '1'
        },
        {
            id: '7',
            width: '50',
            height: '200',
            amount: '1'
        },
        {
            id: '8',
            width: '100',
            height: '50',
            amount: '4'
        },
        {
            id: '9',
            width: '100',
            height: '50',
            amount: '4'
        },
        {
            id: '10',
            width: '150',
            height: '50',
            amount: '4'
        },
        {
            id: '11',
            width: '100',
            height: '50',
            amount: '4'
        }
    ],
    modalStates: {
        addDetail: false
    },
    settings: {
        isAdaptiveCanvas: false,
        isMultiCanvases: true
    },
    spinner: false,
    algorithm: '',
    canvas: {
        width: '500',
        height: '500'
    }
};

export default initialStore;