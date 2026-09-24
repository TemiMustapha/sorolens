#!/bin/bash
# Insert get_monitored_page function and doc comments
sed -i '' -e '/pub fn get_all_monitored(env: Env) -> Vec<ContractHealth> {/i\
    /// Gets a page of monitored contracts.\
    pub fn get_monitored_page(env: Env, start: u32, limit: u32) -> (Vec<ContractHealth>, u32) {\
        let registry: Vec<Address> = env\
            .storage()\
            .instance()\
            .get(&DataKey::Registry)\
            .unwrap_or_else(|| Vec::new(&env));\
        let total = registry.len();\
        let mut page = Vec::new(&env);\
        if start < total {\
            for i in start..core::cmp::min(start + limit, total) {\
                if let Some(id) = registry.get(i) {\
                    if let Some(config) = env.storage().instance().get::<_, ContractConfig>(&DataKey::Config(id.clone())) {\
                        page.push_back(ContractHealth {\
                            id: id,\
                            name: config.name,\
                            healthy: true,\
                            last_event_ledger: 0,\
                        });\
                    }\
                }\
            }\
        }\
        (page, total)\
    }\
\
    /// (Legacy) use get_monitored_page for larger sets.\
' contracts/watchdog/src/lib.rs

# Insert test
sed -i '' -e '/assert_eq!(client.get_monitored_count(), 5);/a\
    }\
\
    #[test]\
    fn get_monitored_page_returns_correct_page() {\
        let env = Env::default();\
        let (_admin, client) = setup(&env);\
        let owner = Address::generate(&env);\
        for _ in 0u32..5u32 {\
            let id = Address::generate(&env);\
            let name = symbol_short!("test");\
            client.register_contract(&owner, &id, &name, &60u64);\
        }\
        let (page, total) = client.get_monitored_page(&0, &2);\
        assert_eq!(page.len(), 2);\
        assert_eq!(total, 5);\
' contracts/watchdog/src/lib.rs
