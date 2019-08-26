import "./style.scss";

(function () {
    let changingData,
        dataInput,
        changeDataBtn,
        helpIcon,
        helpPopover,
        reloadDataBtn,
        defaultInputSpeed,
        inputAnimationDuration,
        minDataLengthForDefaultSpeed,
        loading,
        timeoutId,
        api,
        stubs;

    changingData = document.querySelector('.data-container_changing-data a');
    dataInput = document.querySelector('.data-container_data-input input');
    changeDataBtn = document.querySelector('.data-container_change-data-btn button');
    helpIcon = document.querySelector('.help_question-icon');
    helpPopover = document.querySelector('.help_popover');
    reloadDataBtn = document.querySelector('.data-container_reload-data');
    defaultInputSpeed = 60;
    inputAnimationDuration = 2000;
    minDataLengthForDefaultSpeed = 30;
    loading = false;
    timeoutId = null;
    api = "http://localhost:5000";
    stubs = true;

    function setData(data) {
        // Remove all spaces
        data = data.replace(/\s/g, '');
        let linkWithProtocol = getWithProtocol(data);
        let secretLink = getSecretLink(linkWithProtocol);
        changingData.classList.contains('loading') ? changingData.classList.remove('loading') : null
        changingData.href = linkWithProtocol;
        changingData.title = secretLink;
        animateInput(changingData, 'innerHTML', secretLink, 0, getInputSpeed(secretLink));
    }

    function getWithProtocol(link) {
        let pattern = /^((http|https|ftp):\/\/)/;

        if (!pattern.test(link)) {
            return ("http://" + trimByChar(link, '/'));
        }

        return link
    }

    function getSecretLink(link) {
        return link
    }

    function changeData(e) {
        let currentValue = dataInput.value;

        if (currentValue) {
            loading = true;
            setBtnLoading(changeDataBtn, loading);

            sendData(currentValue)
                .then(() => {
                    loading = false
                    setBtnLoading(changeDataBtn, loading)
                })
                .then(resp => {
                    dataInput.value = '';
                    setData(currentValue)
                })
        }
    }

    function updateData () {
        return getData()
            .then(resp => {
                setData(resp)
            })
    }

    function animateInput(element, attribute, text, index, inputSpeed, callback) {
        if (index < text.length) {
            timeoutId ? timeoutId = clearTimeout(timeoutId) : null;
            timeoutId = setTimeout(() => {
                element[attribute] = text.substring(0, index + 1);
                animateInput(element, attribute, text, index + 1, inputSpeed, callback);
            }, inputSpeed);
        }
        else {
            timeoutId ? timeoutId = clearTimeout(timeoutId) : null;
            callback ? callback() : null;
        }
    }

    function getInputSpeed(text) {
        return (text.length >= minDataLengthForDefaultSpeed ?
            Math.round(inputAnimationDuration / text.length)
            : defaultInputSpeed);
    }

    function handleDataInputEnter(e) {
        if (e.keyCode === 13) {
            changeData(e)
        }
    }

    function getData() {
        return stubs ?
            new Promise((res, rej) => {
                setTimeout(() => {
                    res(localStorage.getItem('link') || '...');
                }, 1000);
            })
            : fetch(`${api}/link`)
                .then(res => res.json())
                .then(data => data.link);
    }

    function sendData(data) {
        return stubs ?
            new Promise((res, rej) => {
                setTimeout(() => {
                    localStorage.setItem('link', data);
                    res();
                }, 1000);
            })
            : fetch(`${api}/setlink`, {
                method: "POST",
                body: JSON.stringify({
                    link: data
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
    }

    function setBtnLoading(element, loading) {
        loading ? element.classList.add('loading') : element.classList.remove('loading')
    }

    function setReloadDataBtnLoading(loading) {
        loading ? reloadDataBtn.classList.add('loading') : reloadDataBtn.classList.remove('loading')
    }

    function hideReloadDataBtn () {
        reloadDataBtn.classList.add('hidden')
    }

    function showReloadDataBtn () {
        reloadDataBtn.classList.remove('hidden')
    }

    function toggleReloadDataBtn () {
        if (reloadDataBtn.classList.contains('hidden')) {
            showReloadDataBtn()
        }
        else {
            hideReloadDataBtn()
        }
    }

    function hidePopover (element) {
        element.classList.add('hidden')
    }

    function showPopover (element) {
        element.classList.remove('hidden')
    }

    function togglePopover (element) {
        if (element.classList.contains('hidden')) {
            showPopover(element)
        }
        else {
            hidePopover(element)
        }
    }

    function toggleHelpPopover () {
        togglePopover(helpPopover)
    }

    function trimByChar(string, character) {
        const first = [...string].findIndex(char => char !== character);
        const last = [...string].reverse().findIndex(char => char !== character);
        return string.substring(first, string.length - last);
    }

    function handleWindowClick (e) {
        // Check if helpPopover or helpIcon triggers click
        if (!(helpPopover.contains(e.target) || e.target === helpIcon)) {
            hidePopover(helpPopover)
        }
    }

    function handleReloadDataBtnClick (e) {
        loading = true;
        setReloadDataBtnLoading(loading);
        updateData()
            .then(hideReloadDataBtn)
            .then(() => {
                loading = false;
                setReloadDataBtnLoading(loading);
            })
    }

    // Window listeners
    window.addEventListener('DOMContentLoaded', updateData, false);

    window.addEventListener('load', function () {
        changeDataBtn.addEventListener('click', changeData, false);
        dataInput.addEventListener('keyup', handleDataInputEnter, false);
        helpIcon.addEventListener('click', toggleHelpPopover, false);
        window.addEventListener('click', handleWindowClick, false);
        reloadDataBtn.addEventListener('click', handleReloadDataBtnClick, false);
    }, false);

    window.addEventListener('unload', function () {
        changeDataBtn.removeEventListener('click', changeData, false);
        dataInput.removeEventListener('keyup', handleDataInputEnter, false);
        helpIcon.removeEventListener('click', toggleHelpPopover, false);
        window.removeEventListener('click', handleWindowClick, false);
        reloadDataBtn.removeEventListener('click', handleReloadDataBtnClick, false);
    }, false);
})();