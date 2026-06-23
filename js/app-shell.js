(() => {
    const navigationGroups = [
        [
            ['General_View', 'NavSidebar.General_View', 'General View', 'PAGES/general_view.htm'],
            ['Network', 'NavSidebar.Network', 'Alarm Data', 'PAGES/alarm_data.htm'],
            ['Failure', 'NavSidebar.Failure', 'Failure', 'PAGES/Failure.htm'],
            ['Process', 'NavSidebar.Process', 'Process Data', 'PAGES/Process.htm'],
            ['System', 'NavSidebar.System', 'System Information', 'PAGES/System.htm']
        ],
        [
            ['Parameters', 'NavSidebar.Parameters', 'Parameters', 'PAGES/Parameters.htm'],
            ['SystemSetting', 'NavSidebar.Setting', 'System Setting', 'PAGES/SystemSetting.htm'],
            ['Users', 'NavSidebar.Authorization', 'Authorization', 'PAGES/Users.htm']
        ],
        [
            ['Event', 'NavSidebar.Event', 'Event', 'PAGES/Event.htm'],
            ['SystemLog', 'NavSidebar.Log', 'System Log', 'PAGES/SystemLog.htm'],
            ['Software', 'NavSidebar.Software', 'Software Upgrade', 'PAGES/Software.htm']
        ]
    ];

    function createNavigation(pageId, mobile = false) {
        const sidebar = document.createElement('aside');
        sidebar.className = mobile ? 'mms-mobile-nav' : 'col-sm-3 col-md-2 sidebar';
        sidebar.setAttribute('aria-label', 'Main navigation');

        navigationGroups.forEach(group => {
            const list = document.createElement('ul');
            list.className = 'nav nav-sidebar flex-column';

            group.forEach(([id, localizationKey, label, href]) => {
                const item = document.createElement('li');
                if (!mobile) item.id = id;
                item.className = 'nav-item';

                const link = document.createElement('a');
                link.className = 'nav-link sidebar-link';
                link.href = href;
                link.dataset.localize = localizationKey;
                link.textContent = label;

                if (id === pageId) {
                    item.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }

                item.append(link);
                list.append(item);
            });

            sidebar.append(list);
        });

        return sidebar;
    }

    function createHeader() {
        const header = document.createElement('header');
        header.innerHTML = `
            <nav class="navbar navbar-expand-sm fixed-top mms-navbar">
                <div class="container-fluid">
                    <a class="navbar-brand" href="https://www.wabteccorp.com/" aria-label="Wabtec home">
                        <img src="IMG/FAIVELEY.GIF" alt="Faiveley Transport" width="151" height="45">
                    </a>
                    <span class="navbar-brand d-none d-sm-block position-absolute start-50 translate-middle-x mms-system-title">Wabtec MMS System</span>
                    <div class="flex-grow-1 d-sm-none"></div>
                    <button class="navbar-toggler d-sm-none me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#primaryNavigation" aria-controls="primaryNavigation" aria-label="Open main navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <span class="d-none d-sm-flex align-items-center me-2">
                        <input type="text" id="connectStatus" disabled size="4" class="mms-status-field" aria-label="Connection status">
                    </span>
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item dropdown">
                            <button class="btn nav-link dropdown-toggle d-flex align-items-center mms-user-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Open user menu">
                                <span class="me-1 d-none d-sm-inline"><input type="text" id="username" disabled size="6" class="mms-username-field" aria-label="Current user"></span>
                                <span class="mms-user-avatar" aria-hidden="true">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2c0 .66.54 1.2 1.2 1.2h16.8c.66 0 1.2-.54 1.2-1.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                                </span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a data-localize="NavHeadbar.Help" class="dropdown-item" href="PAGES/Help.htm">Help</a></li>
                                <li><a data-localize="NavHeadbar.Logout" class="dropdown-item" href="INDEX.HTM">Logout</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>`;
        return header;
    }

    function createMobileNavigation(pageId) {
        const navigation = document.createElement('div');
        navigation.id = 'primaryNavigation';
        navigation.className = 'offcanvas offcanvas-start';
        navigation.tabIndex = -1;
        navigation.setAttribute('aria-labelledby', 'primaryNavigationTitle');
        navigation.innerHTML = `
            <div class="offcanvas-header">
                <h2 id="primaryNavigationTitle" class="offcanvas-title h5">Navigation</h2>
                <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close navigation"></button>
            </div>`;
        const body = document.createElement('div');
        body.className = 'offcanvas-body';
        body.append(createNavigation(pageId, true));
        navigation.append(body);
        return navigation;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const main = document.querySelector('main[data-page-content]');
        if (!main) return;

        const pageId = document.body.dataset.page || '';
        main.classList.add('col-sm-9', 'offset-sm-3', 'col-md-10', 'offset-md-2', 'main');
        main.removeAttribute('data-page-content');

        const layout = document.createElement('div');
        layout.className = 'container-fluid';
        const row = document.createElement('div');
        row.className = 'row';
        row.append(createNavigation(pageId), main);
        layout.append(row);

        document.body.prepend(createHeader(), createMobileNavigation(pageId), layout);
    }, { once: true });
})();
