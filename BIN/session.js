const globalData = {
    setUserInfo(uid, loginActiveFlag, accessLevel, maint, service, engineering, inactiveTime, maxCounter) {
        sessionStorage.setItem('uid', uid);
        sessionStorage.setItem('LoginActiveFlag', loginActiveFlag);
        sessionStorage.setItem('Accesslevel', accessLevel);
        sessionStorage.setItem('AccessLevelTempMaint', maint);
        sessionStorage.setItem('AccessLevelTempService', service);
        sessionStorage.setItem('AccessLevelTempEng', engineering);
        sessionStorage.setItem('WebNotActiveTime', inactiveTime);
        sessionStorage.setItem('LoginMaxCounter', maxCounter);
    },
    getUserUid: () => sessionStorage.getItem('uid'),
    getUserLoginActiveFlag: () => sessionStorage.getItem('LoginActiveFlag'),
    getUserAccesslevel: () => sessionStorage.getItem('Accesslevel'),
    getAccesslevelTemp1: () => sessionStorage.getItem('AccessLevelTempMaint'),
    getAccesslevelTemp2: () => sessionStorage.getItem('AccessLevelTempService'),
    getAccesslevelTemp3: () => sessionStorage.getItem('AccessLevelTempEng'),
    getAccesslevelTemp4: () => sessionStorage.getItem('WebNotActiveTime')
};

function RemoveSessionUserID() {
    sessionStorage.removeItem('uid');
    sessionStorage.removeItem('LoginActiveFlag');
    sessionStorage.removeItem('Accesslevel');
    sessionStorage.removeItem('AccesslevelTemp');
}

window.globalData = globalData;
window.RemoveSessionUserID = RemoveSessionUserID;
