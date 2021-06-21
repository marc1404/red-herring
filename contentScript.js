const logPrefix = '[Red Herring Extension]'

observeScrollContainer();

function main(scrollContainerElement) {
    console.info(`${logPrefix} Blue Ocean detected, registering handlers`)
    registerScrollHandler(scrollContainerElement);
    registerKeyUpHandler();
}

function handleKeyUp(event) {
    const { ctrlKey, shiftKey, key } = event;

    if (ctrlKey && key === 'j') {
        redirectToJenkins();
        return;
    }

    if (ctrlKey && key === 'r') {
        rerunBuild();
        return;
    }

    if (shiftKey && key === 'R') {
        restartProcess();
    }
}

function redirectToJenkins() {
    const path = location.pathname;
    const match = path.match(/\/jenkins\/(.+)\/detail\/(PR-\d+)\//);
    const projectName = match[1];
    const prName = match[2];

    if (!projectName || !prName) {
        alert(`Unable to redirect to Jenkins! (projectName: ${projectName}, prName: ${prName})`);
        return;
    }

    const { protocol, host } = window.location;

    location.href = `${protocol}//${host}/job/${projectName}/view/change-requests/job/${prName}/`;
}

function rerunBuild() {
    const buttonElement = document.body.querySelector('a.replay-button');

    if (!buttonElement) {
        alert('Replay button not found, unable to rerun build!')
        return;
    }

    buttonElement.click();
}

function restartProcess() {
    const buttonElement = document.body.querySelector('a.replay-button');

    if (!buttonElement) {
        alert('Restart button not found, unable to rerun build!')
        return;
    }

    buttonElement.click();
}

function registerKeyUpHandler() {
    document.addEventListener('keyup', handleKeyUp);
}

function observeScrollContainer() {
    const observer = new MutationObserver((mutations) => handleMutations(mutations, observer));

    observer.observe(document.body, { childList: true, subtree: true });
}

function handleMutations(mutations, observer) {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.className === 'FullScreen') {
                const element = document.body.querySelector('div.FullScreen-contents');

                if (!element) {
                    console.error('Scroll container element not found, unable to register scroll handler!');
                    break;
                }

                main(element);
                observer.disconnect();
                return;
            }
        }
    }
}

function registerScrollHandler(element) {
    let previousScrollTop = element.scrollTop;

    element.addEventListener('scroll', event => {
        const { scrollTop, scrollHeight, offsetHeight } = event.target;
        const maxScroll = scrollHeight - offsetHeight;

        if (scrollTop === maxScroll) {
            event.target.scrollTop = previousScrollTop;
        }

        previousScrollTop = event.target.scrollTop;
    });
}
