import pandas as pd

# Funzione per trimmare le stringhe
def trim_all_strings(df):
    return df.applymap(lambda x: x.strip() if isinstance(x, str) else x)

# Carica il file CSV
df = pd.read_csv('raw/31072024-pension_funds_with_isc.csv', sep=";", dtype=str, index_col=False)
df_fpn_return = pd.read_csv('raw/31122023-fpn_performances.csv', sep=";", dtype=str, index_col=False)
df_fpa_return = pd.read_csv('raw/31122023-fpa_performances.csv', sep=";", dtype=str, index_col=False)
df_pip_return = pd.read_csv('raw/31122023-pip_performances.csv', sep=";", dtype=str, index_col=False)

# Trova tutte le colonne presenti in almeno un DataFrame
all_columns = list(set(df_fpn_return.columns).union(set(df_fpa_return.columns)).union(set(df_pip_return.columns)).union(set(df)))

# Aggiungi le colonne mancanti con valori NaN
for col in all_columns:
    if col not in df_fpn_return.columns:
        df_fpn_return[col] = pd.NA
    if col not in df_fpa_return.columns:
        df_fpa_return[col] = pd.NA
    if col not in df_pip_return.columns:
        df_pip_return[col] = pd.NA
    if col not in df.columns:
        df[col] = pd.NA

# Riorganizza le colonne per avere lo stesso ordine
df1 = df_fpn_return[all_columns]
df2 = df_fpa_return[all_columns]
df3 = df_pip_return[all_columns]

# Riempie i dati mancanti nelle prime due colonne con quelli della riga precedente
df1[['id', 'name']] = df1[['id', 'name']].fillna(method='ffill')
df2[['id', 'name']] = df2[['id', 'name']].fillna(method='ffill')
df3[['id', 'name']] = df3[['id', 'name']].fillna(method='ffill')

# Concatenare i DataFrame
df_concatenated = pd.concat([df1, df2, df3])

# Applicare la funzione trim ai dataframe
df = trim_all_strings(df)
df_concatenated = trim_all_strings(df_concatenated)


# Unisci i due dataframe sulla base dei valori delle colonne 'id', 'branch'
merged_df = pd.merge(df, df_concatenated, on=['id', 'branch'], how='outer', suffixes=('', '_df2'))

# Sostituzione delle colonne comuni con i valori del primo dataframe
for col in df.columns:
    if col not in ['id', 'branch'] and col in df_concatenated.columns:
        merged_df[col] = merged_df.apply(lambda row: row[col] if not pd.isnull(row[col]) else row[col + '_df2'], axis=1)
        merged_df.drop(columns=[col + '_df2'], inplace=True)

# Salva il risultato in un nuovo file CSV
merged_df.to_csv('31122023-pension_funds.csv', sep=';', index=False, )

print("Dati mancanti riempiti e salvati in '31122023-pension_funds.csv'")
