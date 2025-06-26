-- ================================================
-- FUNCAO PARA AUTO-EXCLUSAO DE USUARIO (SELF DELETE)
-- Permite que o proprio usuario exclua sua conta
-- ================================================

-- FUNCAO PARA O USUARIO EXCLUIR SUA PROPRIA CONTA
CREATE OR REPLACE FUNCTION self_delete_user()
RETURNS JSON AS $$
DECLARE
    current_user_id UUID;
    current_user_email TEXT;
    profiles_count INTEGER;
BEGIN
    -- Obter o ID do usuario atual da sessao
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuario nao autenticado'
        );
    END IF;
    
    -- Buscar o email do usuario
    SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;
    
    -- Contar registros do perfil antes da delecao
    SELECT COUNT(*) INTO profiles_count FROM profiles WHERE id = current_user_id;
    
    -- Deletar primeiro o perfil (se existir)
    DELETE FROM profiles WHERE id = current_user_id;
    
    -- Deletar o usuario da autenticacao (CASCADE DELETE automatico para outras tabelas)
    DELETE FROM auth.users WHERE id = current_user_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Conta excluida com sucesso',
        'user_id', current_user_id,
        'email', current_user_email,
        'deleted_profiles', profiles_count
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro ao excluir conta: ' || SQLERRM,
            'user_id', current_user_id,
            'email', current_user_email,
            'error_code', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissao para usuarios autenticados executarem esta funcao
GRANT EXECUTE ON FUNCTION self_delete_user() TO authenticated;

-- ================================================
-- ALTERNATIVA: FUNCAO COM CONFIRMACAO DE EMAIL
-- Versao mais segura que exige confirmacao do email
-- ================================================

CREATE OR REPLACE FUNCTION self_delete_user_with_email(confirm_email TEXT)
RETURNS JSON AS $$
DECLARE
    current_user_id UUID;
    current_user_email TEXT;
    profiles_count INTEGER;
BEGIN
    -- Obter o ID e email do usuario atual da sessao
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuario nao autenticado'
        );
    END IF;
    
    -- Buscar o email do usuario
    SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;
    
    -- Verificar se o email de confirmacao confere
    IF current_user_email != confirm_email THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Email de confirmacao nao confere'
        );
    END IF;
    
    -- Contar registros do perfil antes da delecao
    SELECT COUNT(*) INTO profiles_count FROM profiles WHERE id = current_user_id;
    
    -- Deletar primeiro o perfil (se existir)
    DELETE FROM profiles WHERE id = current_user_id;
    
    -- Deletar o usuario da autenticacao (CASCADE DELETE automatico para outras tabelas)
    DELETE FROM auth.users WHERE id = current_user_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Conta excluida com sucesso',
        'user_id', current_user_id,
        'email', current_user_email,
        'deleted_profiles', profiles_count
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro ao excluir conta: ' || SQLERRM,
            'user_id', current_user_id,
            'email', current_user_email,
            'error_code', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissao para usuarios autenticados executarem esta funcao
GRANT EXECUTE ON FUNCTION self_delete_user_with_email(TEXT) TO authenticated;
