import { GlpiSocket } from './GlpiSocket';
import { GlpiClient } from './GlpiClient';
import { GlpiAPI } from './GlpiAPI';

describe('GlpiAPI', () => {
    let socketCallSpy: jest.SpyInstance;
    let api: GlpiAPI;
    let resolveValue: string;

    beforeEach(() => {
        socketCallSpy = jest.spyOn(GlpiSocket.prototype, 'call');

        const socket = new GlpiSocket('');
        api = new GlpiAPI(socket);
        resolveValue = Math.random().toString(36);
        socketCallSpy.mockResolvedValue(resolveValue);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should killSession', async () => {
        const res = await api.killSession();
        expect(socketCallSpy).toBeCalledWith('GET', 'killSession');
        expect(res).toBe(resolveValue);
    });

    it('should ask for new password', async () => {
        const email = 'someemail@example.com';
        const res = await api.lostPassword(email);
        expect(socketCallSpy).toBeCalledWith('PUT', 'lostPassword', {
            data: { email },
        });
        expect(res).toBe(resolveValue);
    });

    it('should change the password', async () => {
        const email = 'someemail@example.com';
        const newpass = 'newpassword';
        const res = await api.lostPassword(email, newpass, newpass);
        expect(socketCallSpy).toBeCalledWith('PUT', 'lostPassword', {
            data: { email, password_forget_token: newpass, password: newpass },
        });
        expect(res).toBe(resolveValue);
    });

    it('should getMyProfiles', async () => {
        const res = await api.getMyProfiles();
        expect(socketCallSpy).toBeCalledWith('GET', 'getMyProfiles');
        expect(res).toBe(resolveValue);
    });

    it('should getActiveProfile', async () => {
        const res = await api.getActiveProfile();
        expect(socketCallSpy).toBeCalledWith('GET', 'getActiveProfile');
        expect(res).toBe(resolveValue);
    });

    it('should changeActiveProfile', async () => {
        const profileId = 5;
        const res = await api.changeActiveProfile(profileId);
        expect(socketCallSpy).toBeCalledWith('POST', 'changeActiveProfile', {
            data: { profiles_id: profileId },
        });
        expect(res).toBe(resolveValue);
    });

    it('should getMyEntities not recursive', async () => {
        const res = await api.getMyEntities();
        expect(socketCallSpy).toBeCalledWith('GET', 'getMyEntities', {
            params: { is_recursive: false },
        });
        expect(res).toBe(resolveValue);
    });

    it('should getMyEntities recursive', async () => {
        const res = await api.getMyEntities(true);
        expect(socketCallSpy).toBeCalledWith('GET', 'getMyEntities', {
            params: { is_recursive: true },
        });
        expect(res).toBe(resolveValue);
    });

    it('should getActiveEntities', async () => {
        const res = await api.getActiveEntities();
        expect(socketCallSpy).toBeCalledWith('GET', 'getActiveEntities');
        expect(res).toBe(resolveValue);
    });

    it('should changeActiveEntities defaulting to all', async () => {
        const res = await api.changeActiveEntities();
        expect(socketCallSpy).toBeCalledWith('POST', 'changeActiveEntities', {
            data: {
                entities_id: 'all',
                is_recursive: false,
            },
        });
        expect(res).toBe(resolveValue);
    });

    it('should changeActiveEntities with entity id and recursive', async () => {
        const entityId = 20;
        const res = await api.changeActiveEntities(entityId, true);
        expect(socketCallSpy).toBeCalledWith('POST', 'changeActiveEntities', {
            data: {
                entities_id: entityId,
                is_recursive: true,
            },
        });
        expect(res).toBe(resolveValue);
    });

    it('should getFullSession', async () => {
        const res = await api.getFullSession();
        expect(socketCallSpy).toBeCalledWith('GET', 'getFullSession');
        expect(res).toBe(resolveValue);
    });

    it('should getGlpiConfig', async () => {
        const res = await api.getGlpiConfig();
        expect(socketCallSpy).toBeCalledWith('GET', 'getGlpiConfig');
        expect(res).toBe(resolveValue);
    });

    it('should getItem', async () => {
        const item = 'Ticket';
        const id = 4;
        const options = {
            get_hateoas: false,
        };
        const res = await api.getItem(item, id, options);
        expect(socketCallSpy).toBeCalledWith('GET', `${item}/${id}`, {
            params: options,
        });
        expect(res).toBe(resolveValue);
    });

    it('should getItems', async () => {
        const item = 'Ticket';
        const options = {
            is_deleted: false,
        };
        const res = await api.getItems(item, options);
        expect(socketCallSpy).toBeCalledWith('GET', item, {
            params: options,
        });
        expect(res).toBe(resolveValue);
    });

    it('should getItems with params to be serialized', async () => {
        const item = 'Ticket';
        const options = {
            searchText: {
                name: 'somename',
                email: 'someemail@example.com',
            },
        };
        const res = await api.getItems(item, options);
        expect(socketCallSpy).toBeCalledWith('GET', item, {
            params: {
                'searchText[name]': options.searchText.name,
                'searchText[email]': options.searchText.email,
            },
        });
        expect(res).toBe(resolveValue);
    });

    it('should getSubitems', async () => {
        const item = 'Ticket';
        const id = 4;
        const subitem = 'History';
        const options = {
            is_deleted: false,
        };
        const res = await api.getSubitems(item, id, subitem, options);
        expect(socketCallSpy).toBeCalledWith('GET', `${item}/${id}/${subitem}`, {
            params: options,
        });
        expect(res).toBe(resolveValue);
    });

    it('should getSubitems with params to be serialized', async () => {
        const item = 'Ticket';
        const id = 4;
        const subitem = 'History';
        const options = {
            searchText: {
                name: 'somename',
                email: 'someemail@example.com',
            },
        };
        const res = await api.getSubitems(item, id, subitem, options);
        expect(socketCallSpy).toBeCalledWith('GET', `${item}/${id}/${subitem}`, {
            params: {
                'searchText[name]': options.searchText.name,
                'searchText[email]': options.searchText.email,
            },
        });
        expect(res).toBe(resolveValue);
    });

    it('should listSearchOptions without raw param', async () => {
        const item = 'Ticket';
        const res = await api.listSearchOptions(item);
        expect(socketCallSpy).toBeCalledWith('GET', `listSearchOptions/${item}`, { params: {} });
        expect(res).toBe(resolveValue);
    });

    it('should listSearchOptions with raw param', async () => {
        const item = 'Ticket';
        const raw = true;
        const res = await api.listSearchOptions(item, raw);
        expect(socketCallSpy).toBeCalledWith('GET', `listSearchOptions/${item}`, { params: { raw } });
        expect(res).toBe(resolveValue);
    });

    it('should search with params to be serialized', async () => {
        const item = 'Ticket';
        const options = {
            sort: 15,
            criteria: [
                {
                    field: '15',
                    searchtype: 'equals',
                    value: 'test',
                },
                {
                    link: 'AND',
                    field: '18',
                    searchtype: 'equals',
                    value: 'test2',
                },
            ],
        };
        const res = await api.search(item, options);
        expect(socketCallSpy).toBeCalledWith('GET', `search/${item}`, {
            params: {
                'sort': 15,
                'criteria[0][field]': options.criteria[0].field,
                'criteria[0][searchtype]': options.criteria[0].searchtype,
                'criteria[0][value]': options.criteria[0].value,
                'criteria[1][link]': options.criteria[1].link,
                'criteria[1][field]': options.criteria[1].field,
                'criteria[1][searchtype]': options.criteria[1].searchtype,
                'criteria[1][value]': options.criteria[1].value,
            },
        });
        expect(res).toBe(resolveValue);
    });
});
